function toggleColorScheme() {
    const currentStyle = document.querySelector('link[rel="stylesheet"]');
    
    if (currentStyle.getAttribute('href') === 'green.css') {
        currentStyle.setAttribute('href', 'red.css');
    } else {
        currentStyle.setAttribute('href', 'green.css');
    }
}

function toggleSkillsSection() {
    const skillsSection = document.getElementById('umiejetnosci');
    const currentDisplay = window.getComputedStyle(skillsSection).display;
    
    if (currentDisplay === 'none') {
        skillsSection.style.display = 'block';
    } else {
        skillsSection.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const interactionContainer = document.createElement('div');
    interactionContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);';
    
    const colorButton = document.createElement('button');
    colorButton.textContent = '🎨 Zmień kolor';
    colorButton.style.cssText = 'padding: 10px 15px; margin-bottom: 10px; margin-right: 10px; border: none; border-radius: 5px; background: #2e8b57; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    colorButton.addEventListener('click', toggleColorScheme);
    colorButton.addEventListener('mouseover', function() { this.style.background = '#1f6f47'; });
    colorButton.addEventListener('mouseout', function() { this.style.background = '#2e8b57'; });
    
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '👁️ Przełącz Umiejętności';
    toggleButton.style.cssText = 'padding: 10px 15px; border: none; border-radius: 5px; background: #c62828; color: white; cursor: pointer; font-size: 14px; font-weight: bold;';
    toggleButton.addEventListener('click', toggleSkillsSection);
    toggleButton.addEventListener('mouseover', function() { this.style.background = '#8e1b1b'; });
    toggleButton.addEventListener('mouseout', function() { this.style.background = '#c62828'; });
    
    interactionContainer.appendChild(colorButton);
    interactionContainer.appendChild(toggleButton);
    document.body.appendChild(interactionContainer);
});
