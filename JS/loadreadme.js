// === Project Content Loader ===
(function () {
  const readmeContainer = document.getElementById('readmeContent');
  const projectNameLabel = document.querySelector('.project-readme__project-name');
  const projectImage = document.getElementById('projectImage');
  const modelSelector = document.getElementById('modelSelector');
  const projectItems = document.querySelectorAll('.project-list__item');

  const projectDisplay = document.querySelector('.project-display');

  // Add path helper at the top
  function resolvePath(path) {
    // Remove any '../' from the start of the path
    return path.replace(/^\.\.\//, '/');
  }

  const projects = {
    magsafe: {
      name: 'DIY MagSafe Charger',
      image: '/Assets/Images/Project1/MS Side.jpg',
      readme: '/Assets/readmes/project1-readme.md',
      github: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/1-DIY_MagSafe_Charger',
      models: {
        top: '/Assets/STL/Project1/MagSafe Top.stl',
        bottom: '/Assets/STL/Project1/MagSafe Bottom.stl',
      },
    },
    height: {
      name: 'Height Measurement Device',
      image: '#',
      readme: '/Assets/readmes/project2-readme.md',
      github: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/2-Height_Measurement_Device',
      models: {
        case: '/Assets/STL/Project2/Height Measurement 3D design.stl'
      },
      arduino: '/Assets/Other/Project2/height_measurement_V1.ino',
    },
    csportfolio: {
      name: 'CS Portfolio',
      description: 'Computer Science Portfolio - Collection of hardware and software projects',
      github: 'https://github.com/Albertlungu/CS-Portfolio',
      image: '#',
      isFolder: true,
    },
    hackathons: {
      name: 'Hackathons',
      description: 'Collection of hackathon projects from CS Portfolio',
      github: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/Hackathons',
      image: '#',
      isFolder: true,
    },
    daydream: {
      name: 'Daydream 2025',
      description: 'Hackathon project submissions - Ottawa and Global',
      github: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/Hackathons/1-Daydream_2025',
      image: '#',
      isFolder: true,
    },
    daydreamott: {
      name: 'Daydream Ottawa',
      description: 'Ottawa hackathon submission',
      github: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/Hackathons/1-Daydream_2025',
      readme: 'https://raw.githubusercontent.com/Albertlungu/CS-Portfolio/main/Hackathons/1-Daydream_2025/README.md',
      image: '/Assets/Images/Daydream/daydream_ottawa.png',
      language: 'Python',
      cloneUrl: 'git clone https://github.com/Albertlungu/CS-Portfolio.git',
      teammates: [
        { name: 'bsnack', url: 'https://github.com/bsnack' },
        { name: 'EasonYang7', url: 'https://github.com/EasonYang7' }
      ],
    },
    daydreamglobal: {
      name: 'Daydream Global',
      description: 'A calm lil RPG 3D Indie game for DAYDREAM GLOBAL',
      github: 'https://github.com/Albertlungu/ashes_of_the_fallen_demo',
      readme: 'https://raw.githubusercontent.com/Albertlungu/ashes_of_the_fallen_demo/main/README.md',
      image: '/Assets/Images/Daydream/daydream_global.png',
      language: 'GDScript',
      itchIo: 'https://albertlungu.itch.io/ashes-of-the-fallen',
      executable: '/Users/albertlungu/Documents/ashes-of-the-fallen-demo/Ashes of The Fallen.exe',
      customReadme: `# ashes_of_the_fallen_demo

A calm lil RPG 3D Indie game for DAYDREAM GLOBALLLLLLL. Made with Godot editor using some files from the internet (i should prolly cite my sources😰). Don't worry about the code, might've vibecoded some of it... BUT IT WORKS (at least this part for now)!

## What is it?
Basically you just go with the flow of the game. There's no book yet, but I'm prolly gonna add some sort of manual that tells the user all controls and stuff like that. For now, refer to this readme.md for keybinds and stuff.

There's 4 parts to it total:

**Challenge 1: Trial of Wit**
- You have to solve a maze that looks too much like the backrooms
- You get a gem that lets you slow down time of enemy by 2x (hopefully it works)
- Sacrifice 5% of max health per use

**Challenge 2: Trial of Strength:**
- You needa cook some sort of alien monster
- Not sure what you're gonna get as a reward yet

**Challenge 3:** I HAVE NO CLUE WHAT TO DO FOR THIS LAST ONE

**Challenge 4: The Ultimate Sacrifice**
- So basically at the end you js kill urself
- Yeah all that work js to murder your own character
- YOU SAVE THE WORLD THOUGH!!!

## How to run?
Bro its not that deep its a godot project on itch.io

## Keybinds:
- **WASD**: Movement
- **Space Bar**: Jump
- **Ctrl**: Toggle sprint
- **E**: Pick up item
- **LMB**: Attack
- **RMB**: Block`,
    },
    nasaspaceapps: {
      name: 'NASA Space Apps Challenge',
      description: 'NASA Space Apps Challenge hackathon submission',
      github: 'https://github.com/Albertlungu/NASA_Space_Apps',
      githubAlt: 'https://github.com/Albertlungu/CS-Portfolio/tree/main/Hackathons/2-NASA_Space_Apps',
      readme: 'https://raw.githubusercontent.com/Albertlungu/NASA_Space_Apps/main/README.md',
      language: 'TypeScript',
      cloneUrl: 'git clone https://github.com/Albertlungu/NASA_Space_Apps.git',
      startCommands: [
        'cd NASA_Space_Apps',
        'npm install',
        'npm start'
      ],
    },
  };

  let currentKey = null;
  let isPinned = false; // Track if project is pinned by click

  function getProjectData(projectKey = currentKey) {
    if (!projectKey || !projects[projectKey]) {
      return null;
    }
    return projects[projectKey];
  }

  function populateModelSelector(project) {
    if (!modelSelector || !project) {
      return null;
    }

    modelSelector.innerHTML = '';
    const entries = Object.entries(project.models || {});
    if (!entries.length) {
      const placeholder = document.createElement('option');
      placeholder.textContent = 'No 3D models available';
      placeholder.disabled = true;
      placeholder.selected = true;
      modelSelector.appendChild(placeholder);

      // Hide the viewer controls if no models
      const viewerControls = document.querySelector('.viewer-controls');
      if (viewerControls) viewerControls.style.display = 'none';

      return null;
    }

    // Show viewer controls if models exist
    const viewerControls = document.querySelector('.viewer-controls');
    if (viewerControls) viewerControls.style.display = 'flex';

    let firstUrl = null;
    entries.forEach(([key, url], index) => {
      const option = document.createElement('option');
      option.value = url;
      option.textContent = key.replace(/(^|\s)\w/g, (char) => char.toUpperCase());
      if (index === 0) {
        option.selected = true;
        firstUrl = url;
      }
      modelSelector.appendChild(option);
    });

    return firstUrl;
  }

  function setProjectImage(project) {
    if (!projectImage || !project) {
      return;
    }

    const viewerBottom = document.querySelector('.viewer-bottom');

    if (project.image && project.image !== '#') {
      projectImage.src = project.image;
      projectImage.alt = `${project.name} preview`;
      if (viewerBottom) viewerBottom.style.display = 'block';
    } else {
      if (viewerBottom) viewerBottom.style.display = 'none';
    }
  }

  function loadProjectReadme(project) {
    if (!readmeContainer || !project) {
      console.error('Missing required elements for README loading');
      return;
    }

    projectNameLabel.textContent = project.name;

    // Handle folder items
    if (project.isFolder) {
      readmeContainer.innerHTML = `
        <div class="project-info">
          <h2>${project.name}</h2>
          ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
          <p class="project-note">This is a collection of projects. Select individual projects from the list on the left to view details.</p>
          <div class="project-actions">
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              View Folder on GitHub
            </a>
          </div>
        </div>
      `;
      return;
    }

    // Handle custom README for Daydream Global
    if (project.customReadme) {
      const itchIoHTML = project.itchIo ? `
        <div class="itch-io-section">
          <h3>Play on itch.io</h3>
          <a href="${project.itchIo}" target="_blank" rel="noopener noreferrer" class="itch-io-btn">
            Play Ashes of the Fallen
          </a>
        </div>
      ` : '';

      readmeContainer.innerHTML = marked.parse(project.customReadme) + itchIoHTML;
      return;
    }

    if (!project.readme) {
      const fileTypesHTML = project.fileTypes ? `
        <div class="project-file-types">
          <h3>📄 Contents:</h3>
          <ul>
            ${project.fileTypes.map(type => `<li>${type}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      const githubAltHTML = project.githubAlt ? `
        <p class="project-note">💡 Also available in CS Portfolio:
          <a href="${project.githubAlt}" target="_blank" rel="noopener noreferrer">View in CS Portfolio</a>
        </p>
      ` : '';

      readmeContainer.innerHTML = `
        <div class="project-info">
          <h2>${project.name}</h2>
          ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
          ${project.language ? `<p class="project-language"><strong>Language:</strong> ${project.language}</p>` : ''}
          ${fileTypesHTML}
          ${githubAltHTML}
          <p class="project-note">For detailed code and files, visit the GitHub repository below.</p>
        </div>
      `;
      return;
    }

    readmeContainer.textContent = 'Loading README…';

    // Determine if this is a remote or local README
    const isRemoteReadme = project.readme.startsWith('http');
    const readmePath = isRemoteReadme ? project.readme : (project.readme.startsWith('/') ? project.readme : `/${project.readme}`);

    fetch(readmePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load README (${response.status})`);
        }
        return response.text();
      })
      .then(markdown => {
        if (!marked) {
          throw new Error('Markdown parser not available');
        }
        readmeContainer.innerHTML = marked.parse(markdown);

        // Add teammates section for Daydream Ottawa
        if (project.teammates && project.teammates.length > 0) {
          const teammatesHTML = `
            <div class="teammates-section">
              <h3>🎉 Huge Thank You to My Amazing Teammates!</h3>
              <p>This project wouldn't have been possible without our incredible collaboration:</p>
              <div class="teammates-list">
                ${project.teammates.map(teammate => `
                  <a href="${teammate.url}" target="_blank" rel="noopener noreferrer" class="teammate-link">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    ${teammate.name}
                  </a>
                `).join('')}
              </div>
            </div>
          `;
          readmeContainer.innerHTML += teammatesHTML;
        }

        // Add clone command section
        if (project.cloneUrl) {
          const cloneHTML = `
            <div class="clone-section">
              <h3>Clone this repository</h3>
              <div class="clone-command">
                <code>${project.cloneUrl}</code>
                <button onclick="navigator.clipboard.writeText('${project.cloneUrl}')" class="copy-btn">Copy</button>
              </div>
            </div>
          `;
          readmeContainer.innerHTML += cloneHTML;
        }

        // Add start commands section for NASA Space Apps
        if (project.startCommands && project.startCommands.length > 0) {
          const startCommandsHTML = `
            <div class="start-commands-section">
              <h3>Getting Started</h3>
              <ol class="start-commands-list">
                ${project.startCommands.map(cmd => `<li><code>${cmd}</code></li>`).join('')}
              </ol>
            </div>
          `;
          readmeContainer.innerHTML += startCommandsHTML;
        }

        // Add schematic viewer after README loads
        if (project.schematic) {
          const schematicViewer = `
            <div class="schematic-viewer">
                <h3>Circuit Schematic</h3>
                <img src="${project.schematic}" alt="Circuit schematic" class="schematic-image">
            </div>
          `;
          readmeContainer.innerHTML += schematicViewer;
        }

        // Load additional content after README
        if (project.arduino) {
          loadArduinoCode(project.arduino);
        }
      })
      .catch(error => {
        console.error('README loading error:', error);
        readmeContainer.innerHTML = `
          <div class="error-message">
            Failed to load README: ${error.message}
            <br>
            Path attempted: ${readmePath}
          </div>
        `;
      });
  }

  // Separate function for loading Arduino code
  function loadArduinoCode(path) {
    if (!readmeContainer || !path) {
      return;
    }

    // Use resolved paths
    fetch(resolvePath(path))
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(code => {
        const codeSection = `
          <div class="code-section">
            <h3>Arduino Code</h3>
            <pre><code class="language-cpp">${code}</code></pre>
          </div>`;
        readmeContainer.innerHTML += codeSection;
        if (window.Prism) Prism.highlightAll();
      })
      .catch(error => {
        console.error('Error loading Arduino code:', error);
        readmeContainer.innerHTML += `<div class="error-message">Failed to load Arduino code: ${error.message}</div>`;
      });
  }

  function updateActiveListItem(projectKey) {
    projectItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.projectKey === projectKey);
    });
  }

  function notifyModelChange(modelUrl) {
    if (!modelUrl) {
      return;
    }
    const event = new CustomEvent('project:modelChange', {
      detail: { modelUrl },
    });
    document.dispatchEvent(event);
  }

  function showProject(projectKey) {
    const project = getProjectData(projectKey);
    if (!project) {
      console.warn(`Project data not found for key: ${projectKey}`);
      return;
    }

    // Update GitHub link
    const githubLinkContainer = projectDisplay?.querySelector('.project-github-link');
    if (githubLinkContainer) {
      if (project.github) {
        githubLinkContainer.innerHTML = `
                <a href="${project.github}" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    View Project on GitHub
                </a>`;
      } else {
        githubLinkContainer.innerHTML = '';
      }
    }

    // Show/hide STL viewer based on whether project has models
    const viewerTop = document.querySelector('.viewer-top');
    if (viewerTop) {
      if (project.models && Object.keys(project.models).length > 0) {
        viewerTop.style.display = 'flex';
      } else {
        viewerTop.style.display = 'none';
      }
    }

    projectDisplay?.classList.remove('project-display--hidden');
    updateActiveListItem(projectKey);
    setProjectImage(project);
    loadProjectReadme(project);
    const initialModelUrl = project.models ? resolvePath(Object.values(project.models)[0]) : null;
    populateModelSelector(project);

    const updateEvent = new CustomEvent('project:update', {
      detail: {
        projectKey,
        modelUrl: initialModelUrl,
      },
    });
    document.dispatchEvent(updateEvent);

    if (initialModelUrl) {
      notifyModelChange(initialModelUrl);
    }

    if (projectDisplay) {
      projectDisplay.classList.add('project-display--revealed');
      projectDisplay.classList.remove('project-display--hidden');
    }
  }

  function hideProject() {
    projectDisplay?.classList.remove('project-display--revealed');
    projectDisplay?.classList.add('project-display--hidden');
    updateActiveListItem('');
  }

  function handleSelectorChange(event) {
    notifyModelChange(event.target.value);
  }

  function handleProjectClick(event) {
    const key = event.currentTarget.dataset.projectKey;
    if (!key) {
      return;
    }

    // If clicking the same project that's pinned, unpin it
    if (key === currentKey && isPinned) {
      isPinned = false;
      currentKey = null;
      hideProject();
    } else {
      // Pin the new project
      isPinned = true;
      currentKey = key;
      showProject(key);
    }
  }

  function handleProjectMouseEnter(event) {
    const hoverKey = event.currentTarget.dataset.projectKey;
    if (!isPinned && hoverKey) {
      currentKey = hoverKey;
      showProject(hoverKey);
    }
  }

  function handleProjectMouseLeave(event) {
    const leaveKey = event.currentTarget.dataset.projectKey;
    if (!isPinned && leaveKey === currentKey) {
      currentKey = null;
      hideProject();
    }
  }

  function handleFolderToggle(event) {
    const folderItem = event.currentTarget;
    const folderId = folderItem.dataset.folder;
    const folderContent = document.querySelector(`[data-folder-content="${folderId}"]`);
    const toggle = folderItem.querySelector('.folder-toggle');

    if (folderContent) {
      const isOpen = folderContent.classList.contains('open');

      if (isOpen) {
        folderContent.classList.remove('open');
        if (toggle) toggle.textContent = '▶';
      } else {
        folderContent.classList.add('open');
        if (toggle) toggle.textContent = '▼';
      }
    }

    // Stop propagation to prevent triggering project display
    event.stopPropagation();
  }

  function init() {
    if (!projectItems.length) {
      return;
    }

    projectItems.forEach((item) => {
      // Check if this is a folder item
      if (item.dataset.folder) {
        item.addEventListener('click', handleFolderToggle);
      } else {
        item.addEventListener('click', handleProjectClick);
        item.addEventListener('mouseenter', handleProjectMouseEnter);
        item.addEventListener('mouseleave', handleProjectMouseLeave);
      }
    });

    if (modelSelector) {
      modelSelector.addEventListener('change', handleSelectorChange);
    }

    // Start with display hidden
    projectDisplay?.classList.add('project-display--hidden');
    projectDisplay?.classList.remove('project-display--revealed');

    // Hide all folder contents by default
    document.querySelectorAll('[data-folder-content]').forEach(folder => {
      folder.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();