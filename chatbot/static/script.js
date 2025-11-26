// static/script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const fileInput = document.querySelector('.file-input');
  const fileLabel = document.querySelector('.file-label');
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(loadingOverlay);

  // Drag and drop handlers
  const wrapper = document.querySelector('.file-input-wrapper');

  wrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    wrapper.classList.add('dragover');
  });

  wrapper.addEventListener('dragleave', () => {
    wrapper.classList.remove('dragover');
  });

  wrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    wrapper.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    updateFileName();
  });

  // File input change handler
  fileInput.addEventListener('change', updateFileName);

  // Form submission handler
  form.addEventListener('submit', () => {
    loadingOverlay.style.display = 'flex';
  });

  function updateFileName() {
    if (fileInput.files.length > 0) {
      fileLabel.innerHTML = `<i class="fas fa-file-upload"></i> ${fileInput.files[0].name}`;
    }
  }
});