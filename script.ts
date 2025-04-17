const fetchButton = document.getElementById('fetch-issue') as HTMLButtonElement;
const clearButton = document.getElementById('clear-output') as HTMLButtonElement;
const outputDiv = document.getElementById('output') as HTMLDivElement;
const repoInput = document.getElementById('repo-input') as HTMLInputElement;
const totalCount = document.getElementById('total-count') as HTMLSpanElement;
const prsCount = document.getElementById('prs-count') as HTMLSpanElement;
const issuesCount = document.getElementById('issues-count') as HTMLSpanElement;
const openIssuesCount = document.getElementById('open-issues-count') as HTMLSpanElement;
let entryCount = 0; // Counter to track the number of entries
let prevIssue = -1;
let optionKeyHeld = false;

// Add event listeners for Option key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Alt' || e.key === 'Option') {
        optionKeyHeld = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Alt' || e.key === 'Option') {
        optionKeyHeld = false;
    }
});

interface GitHubIssue {
    state: string;
    number: number;
    title: string;
    html_url: string;
    pull_request?: {
        url: string;
    };
}

let allIssuesGlobal: GitHubIssue[] = [];

async function fetchGitHubIssues(repo: string): Promise<GitHubIssue[]> {
    appendOutput('fetchGitHubIssues()', undefined, undefined, true)
    if (allIssuesGlobal.length > 0) {
        appendOutput('Using cached issues.', undefined, undefined, true);
        return allIssuesGlobal;
    }

    appendOutput('Fetching issues...', undefined, undefined, true);
    
    let url = new URL('https://api.github.com');
    url.pathname = `/repos/${repo}/issues`;
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', '1');
    url.searchParams.set('state', 'all'); // open, closed, or all

    let allIssues: GitHubIssue[] = [];
    let currentPage = 1;

    while (true) {
        appendOutput(`Fetching page ${currentPage}...`, undefined, undefined, true);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch issues (page ${currentPage}): ${response.statusText}`);
        }

        const issues = await response.json() as GitHubIssue[];
        appendOutput(`Fetched page ${currentPage}, ${issues.length} more issues...`, undefined, undefined, true);
        allIssues = [...allIssues, ...issues];
        updateStatusFields(allIssues);

        const linkHeader = response.headers.get('Link');
        const nextLink = linkHeader?.match(/<(.*)>; rel="next"/)?.[1];
        
        if (!nextLink) {
            break;
        }

        appendOutput(`Next link: ${nextLink}...`, undefined, undefined, true);

        url = new URL(nextLink);
        currentPage++;
    }

    allIssuesGlobal = allIssues;

    return allIssues;
}

async function getRandomIssue(repo: string): Promise<void> {
    if (!repo.includes('/')) {
        appendOutput('Invalid repository format. Use "owner/repo".', undefined, undefined);
        return;
    }

    fetchButton.disabled = true;

    try {
        const allIssues = await fetchGitHubIssues(repo);
        const openIssues = allIssues.filter((issue: GitHubIssue) => !issue.pull_request && issue.state === 'open');
        if (openIssues.length === 0) {
            appendOutput('No issues found.', undefined, undefined);
        } else {
            // Try three times in case we chose the same issue twice in a row
            for (let i = 0; i < 3; i++) {
                const randomIssue = openIssues[Math.floor(Math.random() * openIssues.length)];
                if (randomIssue.number !== prevIssue) {
                    appendOutput(randomIssue.title, randomIssue.number, randomIssue.html_url);
                    prevIssue = randomIssue.number;
                    break;
                }
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            appendOutput(`Error fetching issues: ${error.message}`, undefined, undefined);
        } else {
            appendOutput('Unknown error occurred.', undefined, undefined);
        }
    } finally {
        fetchButton.disabled = false;

        // Wait for the animation to finish before removing the spin class
        setTimeout(() => {
            fetchButton.classList.remove('spin'); // Remove spin class to stop spinning
        }, 1000); // Match this duration to the CSS animation duration (1s)
    }
}

function updateStatusFields(issues: GitHubIssue[]) {
    const total = issues.length;
    const prs = issues.filter(issue => issue.pull_request).length;
    const allIssues = issues.filter(issue => !issue.pull_request).length;
    const openIssues = issues.filter(issue => !issue.pull_request && issue.state === 'open').length;

    totalCount.textContent = `Total: ${total}`;
    prsCount.textContent = `PRs: ${prs}`;
    issuesCount.textContent = `Issues: ${allIssues}`;
    openIssuesCount.textContent = `Open: ${openIssues}`;
}

function appendOutput(title: string, issueNumber?: number, url?: string, debug?: boolean) {
    const newOutput = document.createElement('div');
    newOutput.innerHTML = `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;">${issueNumber !== undefined ? `#${issueNumber} - ` : ''}${title}</a>`;
    
    // Alternate background colour for every second entry
    if (entryCount % 2 === 1) {
        newOutput.style.backgroundColor = '#f9f9f9'; // Light grey for even entries
    }
    
    // Only show debug messages if Option key is held down
    if (debug && !optionKeyHeld) return;
    
    // Show debug messages in red
    if (debug) {
        newOutput.style.color = 'red';
    }
    
    outputDiv.appendChild(newOutput);
    entryCount++; // Increment the counter

    // Scroll the terminal to the bottom
    const terminal = document.getElementById('terminal') as HTMLDivElement;
    terminal.scrollTop = terminal.scrollHeight;
}

if (fetchButton && outputDiv && repoInput) {
    fetchButton.addEventListener('click', () => {
        const repo = repoInput.value.trim();
        if (repo) {
            fetchButton.classList.add('spin'); // Add spin class to start spinning
            getRandomIssue(repo);
        } else {
            appendOutput('Please enter a repository name.', undefined, undefined);
        }
    });
}

if (clearButton && outputDiv) {
    clearButton.addEventListener('click', () => {
        outputDiv.innerHTML = '';
    });
}