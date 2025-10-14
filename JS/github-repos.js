// Fetch and display GitHub repositories
(function() {
    const username = 'Albertlungu'; // Replace with your GitHub username
    const reposContainer = document.getElementById('githubRepos');
    
    if (!reposContainer) return;
    
    async function fetchGitHubRepos() {
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            
            const repos = await response.json();
            
            if (repos.length === 0) {
                reposContainer.innerHTML = '<p style="color: rgba(255, 233, 199, 0.6);">No public repositories found.</p>';
                return;
            }
            
            reposContainer.innerHTML = repos.map(repo => `
                <div class="repo-item">
                    <a href="${repo.html_url}" class="repo-item__name" target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                        </svg>
                        ${repo.name}
                    </a>
                    ${repo.description ? `<p class="repo-item__description">${repo.description}</p>` : ''}
                    <div class="repo-item__stats">
                        ${repo.language ? `<span class="repo-stat">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="8" r="8"/>
                            </svg>
                            ${repo.language}
                        </span>` : ''}
                        <span class="repo-stat">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                            </svg>
                            ${repo.stargazers_count}
                        </span>
                        <span class="repo-stat">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                            </svg>
                            ${repo.forks_count}
                        </span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error fetching GitHub repos:', error);
            reposContainer.innerHTML = `
                <p style="color: rgba(255, 140, 60, 0.8);">
                    Unable to load repositories. Please check your connection or try again later.
                </p>
            `;
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchGitHubRepos);
    } else {
        fetchGitHubRepos();
    }
})();
