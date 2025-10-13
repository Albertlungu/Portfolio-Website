// === Project Content Loader ===
(function () {
  const readmeContainer = document.getElementById('readmeContent');
  const projectNameLabel = document.querySelector('.project-readme__project-name');
  const projectImage = document.getElementById('projectImage');
  const modelSelector = document.getElementById('modelSelector');
  const projectItems = document.querySelectorAll('.project-list__item');

  const projectDisplay = document.querySelector('.project-display');

  const projects = {
    magsafe: {
      name: 'DIY MagSafe Charger',
      image: '../Assets/Images/Project1/MS Side.jpg',
      readme: '../Assets/readmes/project1-readme.md',
      models: {
        top: '../Assets/STL/Project1/MagSafe Top.stl',
        bottom: '../Assets/STL/Project1/MagSafe Bottom.stl',
      },
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
      return;
    }

    readmeContainer.textContent = 'Loading README…';
    projectNameLabel.textContent = project.name;

    fetch(project.readme)
      .then((response) => {
        if (!response.ok) {
          throw new Error('README not found');
        }
        return response.text();
      })
      .then((markdown) => {
        const html = typeof marked !== 'undefined' ? marked.parse(markdown) : markdown;
        readmeContainer.innerHTML = html;
      })
      .catch((error) => {
        console.error('Error loading README:', error);
        readmeContainer.innerHTML = '<p style="color:#888;">Could not load README file.</p>';
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
    
    if (projectDisplay) {
      projectDisplay.classList.add('project-display--revealed');
      projectDisplay.classList.remove('project-display--hidden');
    }
    updateActiveListItem(projectKey);
    setProjectImage(project);
    loadProjectReadme(project);
    const initialModelUrl = populateModelSelector(project);

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
  }

  function hideProject() {
    if (projectDisplay) {
      projectDisplay.classList.add('project-display--hidden');
      projectDisplay.classList.remove('project-display--revealed');
    }
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
    
    // Only show on hover if not pinned to a different project
    if (!isPinned && hoverKey) {
      currentKey = hoverKey;
      showProject(hoverKey);
    }
  }

  function handleProjectMouseLeave(event) {
    const leaveKey = event.currentTarget.dataset.projectKey;
    
    // Only hide on mouse leave if not pinned
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
    if (projectDisplay) {
      projectDisplay.classList.add('project-display--hidden');
      projectDisplay.classList.remove('project-display--revealed');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();