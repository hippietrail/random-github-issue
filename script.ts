const fetchButton = document.getElementById('fetch-issue') as HTMLButtonElement;
const clearButton = document.getElementById('clear-output') as HTMLButtonElement;
const outputDiv = document.getElementById('output') as HTMLDivElement;
const repoInput = document.getElementById('repo-input') as HTMLInputElement;
let entryCount = 0; // Counter to track the number of entries
let prevIssue = -1;

interface GitHubIssue {
    number: number;
    title: string;
    html_url: string;
    pull_request?: {
        url: string;
    };
}

async function fetchRandomIssue(repo: string): Promise<void> {
    if (!repo.includes('/')) {
        appendOutput('Invalid repository format. Use "owner/repo".', undefined, undefined);
        return;
    }

    fetchButton.disabled = true;

    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/issues`);
        if (!response.ok) {
            throw new Error(`Failed to fetch issues: ${response.statusText}`);
        }
        const allIssues = await response.json() as GitHubIssue[];
        const issues = allIssues.filter((issue: GitHubIssue) => !issue.pull_request);
        if (issues.length === 0) {
            appendOutput('No issues found.', undefined, undefined);
        } else {
            // Try three times in case we chose the same issue twice in a row
            for (let i = 0; i < 3; i++) {
                const randomIssue = issues[Math.floor(Math.random() * issues.length)];
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

function appendOutput(title: string, issueNumber?: number, url?: string) {
    const newOutput = document.createElement('div');
    newOutput.innerHTML = `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;">${issueNumber !== undefined ? `#${issueNumber} - ` : ''}${title}</a>`;
    
    // Alternate background colour for every second entry
    if (entryCount % 2 === 1) {
        newOutput.style.backgroundColor = '#f9f9f9'; // Light grey for even entries
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
            fetchRandomIssue(repo);
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