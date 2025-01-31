const fetchButton = document.getElementById('fetch-issue') as HTMLButtonElement;
const clearButton = document.getElementById('clear-output') as HTMLButtonElement;
const output = document.getElementById('output') as HTMLDivElement;
const repoInput = document.getElementById('repo-input') as HTMLInputElement;

let entryCount = 0; // Counter to track the number of entries

async function fetchRandomIssue(repo: string): Promise<void> {
    if (!repo.includes('/')) {
        appendOutput('Invalid repository format. Use "owner/repo".', undefined, undefined);
        return;
    }

    fetchButton.disabled = true;
    // fetchButton.textContent = '🎲🎲';//'Fetching...';

    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/issues`);
        if (!response.ok) {
            throw new Error(`Failed to fetch issues: ${response.statusText}`);
        }
        const issues = await response.json();
        if (issues.length === 0) {
            appendOutput('No issues found.', undefined, undefined);
        } else {
            const randomIssue = issues[Math.floor(Math.random() * issues.length)];
            appendOutput(randomIssue.title, randomIssue.number, randomIssue.html_url);
        }
    } catch (error) {
        if (error instanceof Error) {
            appendOutput(`Error fetching issues: ${error.message}`, undefined, undefined);
        } else {
            appendOutput('Unknown error occurred.', undefined, undefined);
        }
    } finally {
        fetchButton.disabled = false;
        // fetchButton.textContent = '🎲';

        // Wait for the animation to finish before removing the spin class
        setTimeout(() => {
            fetchButton.classList.remove('spin'); // Remove spin class to stop spinning
        }, 1000); // Match this duration to the CSS animation duration (1s)
    }
}

function appendOutput(title: string, issueNumber?: number, url?: string) {
    const newOutput = document.createElement('div');
    newOutput.innerHTML = `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;">${issueNumber !== undefined ? `#${issueNumber} - ` : ''}${title}</a>`;
    
    // Alternate background color for every second entry
    if (entryCount % 2 === 1) {
        newOutput.style.backgroundColor = '#f9f9f9'; // Light gray for even entries
    }
    
    output.appendChild(newOutput);
    entryCount++; // Increment the counter

    // Scroll the terminal to the bottom
    const terminal = document.getElementById('terminal') as HTMLDivElement;
    terminal.scrollTop = terminal.scrollHeight;
}

if (fetchButton && output && repoInput) {
    fetchButton.addEventListener('click', function () {
        const repo = repoInput.value.trim();
        if (repo) {
            fetchButton.classList.add('spin'); // Add spin class to start spinning
            fetchRandomIssue(repo);
        } else {
            appendOutput('Please enter a repository name.', undefined, undefined);
        }
    });
}

if (clearButton && output) {
    clearButton.addEventListener('click', function () {
        output.innerHTML = '';
    });
}