var request = require('request');
var btoa = require('btoa');
const PropertiesReader = require('properties-reader');

const prop = PropertiesReader('application.properties');
getProperty = (pty) => {return prop.get(pty);}

const pageSize = 30;
let currentPage = 1;

const gitOrg = getProperty('git.organization');
const gitUser = getProperty('git.user');
const gitToken = getProperty('git.token');
const gitBranch = getProperty('git.branch');
const useProxy = getProperty('proxy.isEnabled');
const proxyUrl = getProperty('proxy.url');

const gitHubBaseUrl = 'https://api.github.com';
const authorizationToken = 'Basic ' + btoa(gitUser + ':' + gitToken);

main();

async function main() {
    console.log("Getting all repositories from github organization : " + gitOrg);
    let allRepositories = await loadRepositories();
    console.log("Reading all repositories to get matching branches : " + gitBranch);
    let matchingRepositories = await browseRepositoriesBranches(allRepositories);
    console.log(matchingRepositories.length + " repositories with " + gitBranch + " branch found :");
    console.log(matchingRepositories);
}

/**
 * Load all repositories from GitHub organization
 * @returns List of repositories
 */
async function loadRepositories() {
    let allRepositories = [];
    let moreRepositories = true;
    do {
        let newRepositories = await makeHttpCall(gitHubBaseUrl + '/orgs/' + gitOrg + '/repos?perPage=' + pageSize + '&page=' + currentPage);
        if (newRepositories.length > 0) {
            allRepositories.push.apply(allRepositories, newRepositories);
            currentPage++;
        } else {
            moreRepositories = false;
        }

    } while(moreRepositories);
    console.log(allRepositories.length + " repositories found");
    return allRepositories;
} 

/**
 * Read all branches from every repository found and check if there is one matching the one we're looking for
 * @param {*} allRepositories All repositories from the organization
 * @returns List of matching repositories
 */
async function browseRepositoriesBranches(allRepositories) {
    var matchingRepositories = [];
    for (var repositoryId in allRepositories) {
        let repositoryName = allRepositories[repositoryId].name;
        let branches = await makeHttpCall(gitHubBaseUrl + '/repos/' + gitOrg + '/' + repositoryName + '/branches');
        if (branches && branches.length > 0) {
            branches.forEach(branch => {
                if (branch.name === gitBranch) {
                    matchingRepositories.push(repositoryName);
                }
            })    
        }
    }
    return matchingRepositories;
}

/**
 * Send the http call, add proxy if the property proxy.isEnabled is set to true
 * @param {*} url Url to call
 * @returns Promise with the parsed JSON response
 */
async function makeHttpCall(url) {
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request',
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };
    if (useProxy === true) {
        options.proxy = proxyUrl;
    }

    return new Promise((resolve, reject) => {
        var data = "";
        request(options)
            .on('data', function(chunk) {
                return data += chunk;
            })
            .on('end', function() {
                resolve(JSON.parse(data));
            }).on('error', function(err) {
                console.log("Error during HTTP request");
                reject();
            });
    });
}