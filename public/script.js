// Prevent right-click context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Prevent common copy/cut/paste shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A
  if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

// Get the textarea element
const blogTextarea = document.getElementById('blog');
const wordCountDisplay = document.getElementById('wordCount');

// Prevent paste
if (blogTextarea) {
  blogTextarea.addEventListener('paste', (e) => {
    e.preventDefault();
    alert('Pasting is disabled for fair evaluation.');
  });

  // Update word count on input
  blogTextarea.addEventListener('input', updateWordCount);
  blogTextarea.addEventListener('keyup', updateWordCount);
}

function updateWordCount() {
  const text = blogTextarea.value.trim();
  const words = text.length === 0 ? 0 : text.split(/\s+/).filter(Boolean).length;
  
  if (wordCountDisplay) {
    wordCountDisplay.querySelector('span').textContent = words;
    
    // Change color based on word count
    if (words >= 250) {
      wordCountDisplay.style.color = '#22c55e'; // Green
    } else if (words >= 150) {
      wordCountDisplay.style.color = '#eab308'; // Yellow
    } else {
      wordCountDisplay.style.color = '#94a3b8'; // Gray
    }
  }
}

// Form submission validation
const blogForm = document.getElementById('blogForm');
if (blogForm) {
  blogForm.addEventListener('submit', (e) => {
    const blog = blogTextarea.value.trim();
    const wordCount = blog.length === 0 ? 0 : blog.split(/\s+/).filter(Boolean).length;
    
    if (wordCount < 250) {
      e.preventDefault();
      alert(`Your blog has ${wordCount} words. Minimum 250 words required.`);
      return false;
    }
  });
}

// Initial word count
if (blogTextarea) {
  updateWordCount();
}
