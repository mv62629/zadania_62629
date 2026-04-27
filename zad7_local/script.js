function toggleColorScheme() {
    const currentStyle = document.querySelector('link[rel="stylesheet"]');

    if (!currentStyle) {
        return;
    }

    if (currentStyle.getAttribute('href') === 'green.css') {
        currentStyle.setAttribute('href', 'red.css');
    } else {
        currentStyle.setAttribute('href', 'green.css');
    }
}

function toggleSkillsSection() {
    const skillsSection = document.getElementById('umiejetnosci');

    if (!skillsSection) {
        return;
    }

    const currentDisplay = window.getComputedStyle(skillsSection).display;
    skillsSection.style.display = currentDisplay === 'none' ? 'block' : 'none';
}

const DYNAMIC_REFRESH_MS = 3000;
let dynamicRefreshTimer = null;
let lastDynamicSectionsSnapshot = '';
const LOCAL_NOTES_STORAGE_KEY = 'zad7_local_notes';

function createSection(id, title) {
    const section = document.createElement('section');
    section.id = id;

    const heading = document.createElement('h2');
    heading.textContent = title;

    section.appendChild(heading);
    return section;
}

function createArticle(title, role, period, description) {
    const article = document.createElement('article');

    const heading = document.createElement('h3');
    heading.textContent = title;

    const roleElement = document.createElement('p');
    roleElement.className = 'job-title';
    roleElement.textContent = role;

    const periodElement = document.createElement('p');
    periodElement.className = 'job-period';
    periodElement.textContent = period;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;

    article.appendChild(heading);
    article.appendChild(roleElement);
    article.appendChild(periodElement);
    article.appendChild(descriptionElement);

    return article;
}

function buildProfile(profile) {
    const header = document.getElementById('profileHeader');

    if (!header) {
        return;
    }

    header.innerHTML = '';

    const image = document.createElement('img');
    image.src = profile.photo;
    image.alt = profile.photoAlt;
    image.className = 'profile-photo';

    const name = document.createElement('h1');
    name.textContent = profile.name;

    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = profile.title;

    header.appendChild(image);
    header.appendChild(name);
    header.appendChild(subtitle);
}

function buildContact(main, contactData) {
    const section = createSection('kontakt', contactData.title);

    const contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info';

    const emailItem = document.createElement('div');
    emailItem.className = 'contact-item';
    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:' + contactData.email;
    emailLink.textContent = contactData.email;
    emailItem.appendChild(emailLink);

    const phoneItem = document.createElement('div');
    phoneItem.className = 'contact-item phone';
    const phoneLink = document.createElement('a');
    phoneLink.href = 'tel:' + contactData.phone.replace(/\s+/g, '');
    phoneLink.textContent = contactData.phone;
    phoneItem.appendChild(phoneLink);

    const locationItem = document.createElement('div');
    locationItem.className = 'contact-item location';
    locationItem.textContent = contactData.location;

    contactInfo.appendChild(emailItem);
    contactInfo.appendChild(phoneItem);
    contactInfo.appendChild(locationItem);

    const socialLinks = document.createElement('div');
    socialLinks.className = 'social-links';

    contactData.social.forEach(function (item) {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'social-link';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.label;
        socialLinks.appendChild(link);
    });

    section.appendChild(contactInfo);
    section.appendChild(socialLinks);
    main.appendChild(section);
}

function buildAbout(main, aboutData) {
    const section = createSection('o-mnie', aboutData.title);
    const paragraph = document.createElement('p');
    paragraph.className = 'about-text';
    paragraph.textContent = aboutData.text;

    section.appendChild(paragraph);
    main.appendChild(section);
}

function buildSkillsSection(skillsData) {
    const section = createSection('umiejetnosci', skillsData.title);
    const list = document.createElement('ul');
    list.className = 'skills-list';

    skillsData.items.forEach(function (skill) {
        const item = document.createElement('li');
        item.textContent = skill;
        list.appendChild(item);
    });

    section.appendChild(list);
    return section;
}

function buildExperienceSection(experienceData) {
    const section = createSection('doswiadczenie', experienceData.title);

    experienceData.items.forEach(function (item) {
        section.appendChild(createArticle(item.company, item.role, item.period, item.description));
    });

    return section;
}

function buildEducationSection(educationData) {
    const section = createSection('edukacja', educationData.title);

    educationData.items.forEach(function (item) {
        section.appendChild(createArticle(item.school, item.degree, item.period, item.description));
    });

    return section;
}

function buildProjectsSection(projectsData) {
    const section = createSection('projekty', projectsData.title);
    const list = document.createElement('ul');
    list.className = 'project-list';

    projectsData.items.forEach(function (project) {
        const item = document.createElement('li');

        const title = document.createElement('strong');
        title.textContent = project.name;

        const description = document.createElement('p');
        description.textContent = project.description;

        const stack = document.createElement('p');
        stack.textContent = 'Stack: ' + project.stack.join(', ');

        const published = document.createElement('p');
        published.textContent = 'Opublikowano: ' + project.published;

        item.appendChild(title);
        item.appendChild(description);
        item.appendChild(stack);
        item.appendChild(published);
        list.appendChild(item);
    });

    section.appendChild(list);
    return section;
}

function readLocalNotes() {
    try {
        const rawNotes = window.localStorage.getItem(LOCAL_NOTES_STORAGE_KEY);

        if (!rawNotes) {
            return [];
        }

        const parsedNotes = JSON.parse(rawNotes);

        if (!Array.isArray(parsedNotes)) {
            return [];
        }

        return parsedNotes.filter(function (note) {
            return note
                && typeof note === 'object'
                && typeof note.id === 'string'
                && typeof note.text === 'string';
        });
    } catch (error) {
        console.warn('Nie udalo sie odczytac notatek z localStorage:', error);
        return [];
    }
}

function writeLocalNotes(notes) {
    try {
        window.localStorage.setItem(LOCAL_NOTES_STORAGE_KEY, JSON.stringify(notes));
        return true;
    } catch (error) {
        console.warn('Nie udalo sie zapisac notatek do localStorage:', error);
        return false;
    }
}

function renderLocalNotesList(list, notes) {
    list.innerHTML = '';

    if (notes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'local-note-empty';
        emptyItem.textContent = 'Brak wpisow. Dodaj pierwszy wpis.';
        list.appendChild(emptyItem);
        return;
    }

    notes.forEach(function (note) {
        const item = document.createElement('li');
        item.className = 'local-note-item';

        const text = document.createElement('span');
        text.className = 'local-note-text';
        text.textContent = note.text;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'local-note-delete';
        deleteButton.textContent = 'Usun';
        deleteButton.setAttribute('data-note-id', note.id);

        item.appendChild(text);
        item.appendChild(deleteButton);
        list.appendChild(item);
    });
}

function buildLocalStorageSection(main) {
    const section = createSection('local-storage-zadanie7', 'Zadanie 7 - wpisy z localStorage');

    const intro = document.createElement('p');
    intro.className = 'local-note-intro';
    intro.textContent = 'Wpisy sa zapisywane w przegladarce i zostaja po odswiezeniu strony.';

    const form = document.createElement('form');
    form.className = 'local-note-form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'local-note-input';
    input.placeholder = 'Wpisz nowa notatke';
    input.setAttribute('aria-label', 'Nowa notatka');

    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.className = 'local-note-add';
    addButton.textContent = 'Dodaj';

    form.appendChild(input);
    form.appendChild(addButton);

    const status = document.createElement('p');
    status.className = 'local-note-status';

    const list = document.createElement('ul');
    list.className = 'local-note-list';

    let notes = readLocalNotes();
    renderLocalNotesList(list, notes);

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const value = input.value.trim();

        if (!value) {
            status.className = 'local-note-status error';
            status.textContent = 'Wpis nie moze byc pusty.';
            return;
        }

        const newNote = {
            id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000000)),
            text: value
        };

        notes = [newNote].concat(notes);

        if (!writeLocalNotes(notes)) {
            notes = readLocalNotes();
            status.className = 'local-note-status error';
            status.textContent = 'Blad zapisu do localStorage.';
            renderLocalNotesList(list, notes);
            return;
        }

        status.className = 'local-note-status success';
        status.textContent = 'Wpis zapisany.';
        input.value = '';
        renderLocalNotesList(list, notes);
    });

    list.addEventListener('click', function (event) {
        const target = event.target;

        if (!(target instanceof HTMLButtonElement)) {
            return;
        }

        if (!target.classList.contains('local-note-delete')) {
            return;
        }

        const noteId = target.getAttribute('data-note-id');

        if (!noteId) {
            return;
        }

        const updatedNotes = notes.filter(function (note) {
            return note.id !== noteId;
        });

        if (!writeLocalNotes(updatedNotes)) {
            status.className = 'local-note-status error';
            status.textContent = 'Blad usuwania wpisu.';
            return;
        }

        notes = updatedNotes;
        status.className = 'local-note-status success';
        status.textContent = 'Wpis usuniety.';
        renderLocalNotesList(list, notes);
    });

    section.appendChild(intro);
    section.appendChild(form);
    section.appendChild(status);
    section.appendChild(list);
    main.appendChild(section);
}

function replaceSection(main, section) {
    const existingSection = document.getElementById(section.id);

    if (existingSection && existingSection.parentElement === main) {
        main.replaceChild(section, existingSection);
    } else {
        main.appendChild(section);
    }
}

function createDynamicSectionsSnapshot(sections) {
    return JSON.stringify({
        skills: sections.skills,
        experience: sections.experience,
        education: sections.education,
        projects: sections.projects
    });
}

function renderDynamicSections(main, sections, preserveSkillsVisibility) {
    const currentSkillsSection = document.getElementById('umiejetnosci');
    const wasSkillsHidden = preserveSkillsVisibility && currentSkillsSection
        && window.getComputedStyle(currentSkillsSection).display === 'none';

    const skillsSection = buildSkillsSection(sections.skills);
    const experienceSection = buildExperienceSection(sections.experience);
    const educationSection = buildEducationSection(sections.education);
    const projectsSection = buildProjectsSection(sections.projects);

    if (wasSkillsHidden) {
        skillsSection.style.display = 'none';
    }

    replaceSection(main, skillsSection);
    replaceSection(main, experienceSection);
    replaceSection(main, educationSection);
    replaceSection(main, projectsSection);
}

function buildFooter(footerData) {
    const footer = document.getElementById('pageFooter');

    if (!footer) {
        return;
    }

    footer.innerHTML = '';

    const copy = document.createElement('p');
    copy.textContent = '© ' + footerData.copyright;

    const update = document.createElement('p');
    update.textContent = 'Ostatnia aktualizacja: ' + footerData.lastUpdate;

    footer.appendChild(copy);
    footer.appendChild(update);
}

function buildControls() {
    const interactionContainer = document.createElement('div');
    interactionContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);';

    const colorButton = document.createElement('button');
    colorButton.textContent = 'Zmien kolor';
    colorButton.style.cssText = 'padding: 10px 15px; margin-bottom: 10px; margin-right: 10px; border: none; border-radius: 5px; background: #2e8b57; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    colorButton.addEventListener('click', toggleColorScheme);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Przelacz umiejetnosci';
    toggleButton.style.cssText = 'padding: 10px 15px; border: none; border-radius: 5px; background: #c62828; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    toggleButton.addEventListener('click', toggleSkillsSection);

    interactionContainer.appendChild(colorButton);
    interactionContainer.appendChild(toggleButton);
    document.body.appendChild(interactionContainer);
}

async function loadCvData(forceFresh) {
    const requestUrl = forceFresh ? 'cv-data.json?ts=' + Date.now() : 'cv-data.json';
    const response = await fetch(requestUrl, {
        cache: forceFresh ? 'no-store' : 'default'
    });

    if (!response.ok) {
        throw new Error('Nie udalo sie pobrac danych JSON.');
    }

    return response.json();
}

function startDynamicSectionsRefresh(main) {
    if (dynamicRefreshTimer) {
        clearInterval(dynamicRefreshTimer);
    }

    dynamicRefreshTimer = setInterval(async function () {
        try {
            const freshData = await loadCvData(true);
            const freshSnapshot = createDynamicSectionsSnapshot(freshData.sections);

            if (freshSnapshot === lastDynamicSectionsSnapshot) {
                return;
            }

            renderDynamicSections(main, freshData.sections, true);
            lastDynamicSectionsSnapshot = freshSnapshot;
        } catch (error) {
            console.warn('Nie udalo sie odswiezyc sekcji dynamicznych:', error);
        }
    }, DYNAMIC_REFRESH_MS);
}

async function initPage() {
    buildControls();

    const main = document.getElementById('cvContent');

    if (!main) {
        return;
    }

    try {
        const data = await loadCvData();

        main.innerHTML = '';

        buildProfile(data.profile);
        buildContact(main, data.sections.contact);
        buildAbout(main, data.sections.about);
        buildLocalStorageSection(main);
        renderDynamicSections(main, data.sections, false);
        lastDynamicSectionsSnapshot = createDynamicSectionsSnapshot(data.sections);
        buildFooter(data.footer);
        startDynamicSectionsRefresh(main);
    } catch (error) {
        main.innerHTML = '';
        const section = createSection('blad-ladowania', 'Blad ladowania danych');
        const text = document.createElement('p');
        text.textContent = error.message + ' Uruchom strone przez lokalny serwer HTTP.';
        section.appendChild(text);
        main.appendChild(section);
        buildLocalStorageSection(main);
    }
}

document.addEventListener('DOMContentLoaded', initPage);
