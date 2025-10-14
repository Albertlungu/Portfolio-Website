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
      schematic: '/Assets/Images/Project2/schematic.png', // Add exported schematic image path
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
      placeholder.textContent = 'No models available';
      placeholder.disabled = true;
      placeholder.selected = true;
      modelSelector.appendChild(placeholder);
      return null;
    }

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
    projectImage.src = project.image;
    projectImage.alt = `${project.name} preview`;
  }

  function loadProjectReadme(project) {
    if (!readmeContainer || !project || !project.readme) {
      console.error('Missing required elements for README loading');
      return;
    }

    readmeContainer.textContent = 'Loading README…';
    projectNameLabel.textContent = project.name;

    // Ensure path starts with /
    const readmePath = project.readme.startsWith('/') ? project.readme : `/${project.readme}`;

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

  function init() {
    if (!projectItems.length) {
      return;
    }

    projectItems.forEach((item) => {
      item.addEventListener('click', handleProjectClick);
      item.addEventListener('mouseenter', handleProjectMouseEnter);
      item.addEventListener('mouseleave', handleProjectMouseLeave);
    });

    if (modelSelector) {
      modelSelector.addEventListener('change', handleSelectorChange);
    }

    // Start with display hidden
    projectDisplay?.classList.add('project-display--hidden');
    projectDisplay?.classList.remove('project-display--revealed');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();