# Random PR Mode Implementation Ideas

Here are some ideas for adding a 'random PR' mode to your existing 'random issue' functionality:

## Implementation Options

### 1. Toggle Button Approach
- Add a toggle switch between "Issues" and "PRs" next to the fetch button
- Update the UI to show current mode
- Modify `getRandomIssue()` to filter based on the selected mode

### 2. Dedicated Button
- Add a separate "Random PR" button
- Share most of the existing logic but filter for PRs instead of issues

### 3. URL Parameter
- Support `?type=pr` or `?type=issue` in the URL
- Good for sharing direct links to either mode

### 4. Keyboard Shortcut
- Keep the current button but add a modifier key (e.g., Shift+Click) for PR mode

## Code Changes Needed

### UI Updates
- Add mode indicator/selector
- Update status fields to show PR-specific counts
- Consider different styling for PRs vs issues in the output

### Filtering Logic
- Current filter: `!issue.pull_request && issue.state === 'open'`
- For PRs: `!!issue.pull_request && issue.state === 'open'`

### State Management
- Track current mode in a variable
- Update URL when mode changes (if using URL parameters)
- Save mode preference in localStorage

### API Considerations
- The GitHub API already includes PRs in the issues endpoint
- No additional API calls needed, just different filtering
