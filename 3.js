// ─── GLOBAL STATE ───
let globalTopic = '';
let currentSumType = 'brief';
let quizQuestions = [];
let quizScores = [];
let flashcards = [];
let fcIndex = 0;
let quizSubmitted = false;
let fcData = [];
let fcFlipped = false;

// ─── INIT & PROFILE STATE ───
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure default provider is set to mock if nothing is configured
  if (!localStorage.getItem('ai_provider')) {
    localStorage.setItem('ai_provider', 'mock');
  }
  loadProfile();
  
  // Check if review has been submitted before
  if (localStorage.getItem('review_submitted')) {
    const rForm = document.getElementById('reviewForm');
    const rSuccess = document.getElementById('reviewSuccess');
    if (rForm) rForm.style.display = 'none';
    if (rSuccess) rSuccess.style.display = 'block';
    const bubbleText = document.querySelector('.mascot-bubble .bubble-text');
    if (bubbleText) {
      bubbleText.textContent = "Thank you so much! You are going to CRUSH the exam! 🏆";
    }
  }
});

function loadProfile() {
  const name = localStorage.getItem('stud_name');
  const school = localStorage.getItem('stud_school');
  const cls = localStorage.getItem('stud_class');
  const med = localStorage.getItem('stud_medium');
  const board = localStorage.getItem('stud_board');
  const target = localStorage.getItem('stud_target');
  
  const form = document.getElementById('onboardingForm');
  const dash = document.getElementById('profileDashboard');
  
  if (name && cls && board) {
    form.style.display = 'none';
    form.classList.remove('open');
    dash.style.display = 'block';
    dash.classList.add('open');
    
    document.getElementById('dashName').textContent = name;
    document.getElementById('dashDetails').textContent = `${cls} | ${board} Board | ${med} Medium | School: ${school || 'Not Specified'} | Focus: ${target}`;
    
    if (!document.getElementById('plannerOutput').innerHTML) {
      document.getElementById('plannerOutput').style.display = 'block';
      document.getElementById('plannerOutput').innerHTML = `<h3>📚 Welcome to Your Indian Curriculum Revision Planner!</h3><p>Click "Generate Study Plan" above to formulate a customized roadmap based on your profile.</p>`;
    }
  } else {
    form.style.display = 'block';
    form.classList.add('open');
    dash.style.display = 'none';
    dash.classList.remove('open');
  }
}

function saveProfile() {
  const name = document.getElementById('profName').value.trim();
  const school = document.getElementById('profSchool').value.trim();
  const cls = document.getElementById('profClass').value;
  const med = document.getElementById('profMedium').value;
  const board = document.getElementById('profBoard').value;
  const target = document.getElementById('profTarget').value;
  
  if (!name) {
    document.getElementById('profName').style.borderColor = 'var(--red)';
    setTimeout(() => { document.getElementById('profName').style.borderColor = ''; }, 1500);
    showToast('Please enter your name!');
    return;
  }
  
  localStorage.setItem('stud_name', name);
  localStorage.setItem('stud_school', school);
  localStorage.setItem('stud_class', cls);
  localStorage.setItem('stud_medium', med);
  localStorage.setItem('stud_board', board);
  localStorage.setItem('stud_target', target);
  
  showToast('Profile configured successfully!');
  loadProfile();
  scrollToSection('#profile-section');
}

function editProfile() {
  document.getElementById('profName').value = localStorage.getItem('stud_name') || '';
  document.getElementById('profSchool').value = localStorage.getItem('stud_school') || '';
  document.getElementById('profClass').value = localStorage.getItem('stud_class') || 'Class 10';
  document.getElementById('profMedium').value = localStorage.getItem('stud_medium') || 'English';
  document.getElementById('profBoard').value = localStorage.getItem('stud_board') || 'CBSE';
  document.getElementById('profTarget').value = localStorage.getItem('stud_target') || 'Board Exams';
  
  const form = document.getElementById('onboardingForm');
  const dash = document.getElementById('profileDashboard');
  form.style.display = 'block';
  form.classList.add('open');
  dash.style.display = 'none';
  dash.classList.remove('open');
  
  scrollToSection('#profile-section');
}

// ─── PERSONALIZED STUDY PLANNER ───
async function generateStudyPlan() {
  const name = localStorage.getItem('stud_name') || 'Student';
  const cls = localStorage.getItem('stud_class') || 'Class 10';
  const board = localStorage.getItem('stud_board') || 'CBSE';
  const med = localStorage.getItem('stud_medium') || 'English';
  const target = localStorage.getItem('stud_target') || 'Board Exams';
  const timeline = document.getElementById('planTimeline').value;
  
  const timelineText = timeline === '24h' ? '24-Hour Last-Minute Express Plan' : (timeline === '3day' ? '3-Day Focus Revision Plan' : '7-Day Complete Syllabus Roadmap');
  
  document.getElementById('planBtn').disabled = true;
  const out = document.getElementById('plannerOutput');
  out.style.display = 'block';
  out.innerHTML = '';
  
  const prompt = `Create a personalized study and revision plan for a student in India with the following profile:
- Name: ${name}
- Class: ${cls}
- Board: ${board}
- Medium: ${med}
- Exam Target: ${target}
- Planned Timeline: ${timelineText}

Suggest a structured schedule, key NCERT chapters/subjects to prioritize, recommended preparation strategies, and advice on mock papers/notes. Use **bold** for key terms, ## for headings, and group items into bullet points. Keep it under 400 words and customize it specifically to Indian educational standards (CBSE/ICSE marking schemes, state syllabus as appropriate).`;

  try {
    await callAI(prompt, out, 'planLoading');
  } catch(e) {
    showToast('Could not generate plan. Try again.');
  } finally {
    document.getElementById('planBtn').disabled = false;
  }
}

function getMockStudyPlan() {
  const name = localStorage.getItem('stud_name') || 'Student';
  const cls = localStorage.getItem('stud_class') || 'Class 10';
  const board = localStorage.getItem('stud_board') || 'CBSE';
  const med = localStorage.getItem('stud_medium') || 'English';
  const target = localStorage.getItem('stud_target') || 'Board Exams';
  const timeline = document.getElementById('planTimeline').value;
  
  let steps = [];
  if (timeline === '24h') {
    steps = [
      `**Hour 1 - 3**: **NCERT Blueprint Review** - Go through the chapter summary pages in your NCERT textbooks. Focus on equations, definitions, and labeled diagrams.`,
      `**Hour 4 - 6**: **High-Weightage Chapters** - Identify the chapters that carry maximum marks in the ${board} blueprint (e.g. Algebra in Math, Carbon Compounds in Science). Practice their textbook exercise questions.`,
      `**Hour 7 - 9**: **Previous Year Papers (PYQs)** - Solve at least 2 sample question papers or past board papers. Pay close attention to the step-wise marking scheme of ${board}.`,
      `**Hour 10 - 12**: **Formula Sheet & Quick Revision** - Memorize cheat sheets, constants, dates, and flashcards. Avoid studying new topics; focus on reinforcing what you know.`
    ];
  } else if (timeline === '3day') {
    steps = [
      `**Day 1 (Concept Drill)**: Dedicate today to reviewing the conceptual core of all major subjects. Read notes, watch 10-minute revision crash-course videos, and write down key definitions. Focus on clearing basic doubts.`,
      `**Day 2 (Exercise Practice)**: Solve all back-of-chapter questions in your text books. For ${board}, a significant percentage of questions are directly adapted from standard text exercises. Practice drawing clean, labeled diagrams.`,
      `**Day 3 (Timed Testing)**: Sit for a 3-hour timed sample exam under exam-like conditions. Self-evaluate using the official marking scheme to see where you are losing marks on step writing. Review quick-notes before sleeping.`
    ];
  } else {
    steps = [
      `**Day 1 - 2 (Syllabus Mapping)**: Allocate 2 days to divide the chapters into Strong, Weak, and Medium topics. Dedicate these days to understanding your weak concepts through online resources or text tutorials.`,
      `**Day 3 - 4 (Problem Solving)**: Focus on solving class notes, exemplar problems, and numerical tasks. Ensure you write down formula derivations as they are frequently tested in ${board} exams.`,
      `**Day 5 - 6 (PYQs & Mock Papers)**: Solve at least 3 - 4 previous year papers. This helps build time-management skills (e.g. completing Section A, B, C, D in order).`,
      `**Day 7 (Light Review)**: Re-read your self-made formulas, dates, and diagram labels. Sleep early to stay alert for the exam.`
    ];
  }
  
  return `## 📑 Personalized ${timeline === '24h' ? '24-Hour Last-Minute' : (timeline === '3day' ? '3-Day Focus' : '7-Day Complete')} Revision Plan for **${name}**

Designed for **${cls} (${board} Board)** - **${med} Medium**
Targeting: **${target}**

### 🗓 Revision Schedule
${steps.map(s => `- ${s}`).join('\n')}

### 🎯 High-Priority Prep Strategies
1. **Focus on NCERT**: Over 85% of exam questions in ${board} align with NCERT patterns. Master the textbook exercises first.
2. **Step-Wise Marking**: In ${board} examinations, writing formulas, drawing diagrams, and showing steps secures partial marks, even if the final numerical calculation is incorrect.
3. **Language/Medium Tips**: Since you are writing in **${med} Medium**, ensure you write clean, clear definitions using standard terminology from your official syllabus.

### 💡 General Exam Advice
- **Sleep & Diet**: Get at least 7 hours of sleep before the exam. A fatigued brain struggles with retrieval.
- **Section Time Management**: Spend no more than 2 minutes on 1-mark MCQs, leaving ample time for 5-mark long descriptive questions.`;
}

// ─── SETTINGS MODAL CONTROLS ───
function openSettings() {
  const m = document.getElementById('settingsModal');
  m.style.display = 'flex';
  setTimeout(() => m.classList.add('visible'), 10);
  
  document.getElementById('providerSelect').value = localStorage.getItem('ai_provider') || 'mock';
  document.getElementById('apiKeyInput').value = localStorage.getItem('ai_apikey') || '';
  document.getElementById('proxyInput').value = localStorage.getItem('ai_proxy') || '';
  toggleProviderFields();
}

function closeSettings(e) {
  const m = document.getElementById('settingsModal');
  m.classList.remove('visible');
  setTimeout(() => m.style.display = 'none', 250);
}

function toggleProviderFields() {
  const provider = document.getElementById('providerSelect').value;
  const keyGroup = document.getElementById('apiKeyGroup');
  const proxyGroup = document.getElementById('proxyGroup');
  const keyLabel = document.getElementById('apiKeyLabel');
  const keyHelp = document.getElementById('apiKeyHelp');
  
  if (provider === 'mock') {
    keyGroup.style.display = 'none';
    proxyGroup.style.display = 'none';
  } else if (provider === 'gemini') {
    keyGroup.style.display = 'flex';
    proxyGroup.style.display = 'none';
    keyLabel.textContent = 'Gemini API Key';
    keyHelp.textContent = 'Get a free Gemini API Key from Google AI Studio. Stored locally in your browser.';
  } else if (provider === 'claude') {
    keyGroup.style.display = 'flex';
    proxyGroup.style.display = 'flex';
    keyLabel.textContent = 'Claude API Key';
    keyHelp.textContent = 'Anthropic console key. Direct browser calls will fail due to CORS without a proxy.';
  }
}

function saveSettings() {
  const p = document.getElementById('providerSelect').value;
  const k = document.getElementById('apiKeyInput').value.trim();
  const px = document.getElementById('proxyInput').value.trim();
  
  localStorage.setItem('ai_provider', p);
  localStorage.setItem('ai_apikey', k);
  localStorage.setItem('ai_proxy', px);
  
  showToast('Configuration saved successfully!');
  closeSettings();
}

// ─── GENERAL HELPERS ───
function scrollToSection(id) {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fillTopic(t) {
  document.getElementById('globalTopic').value = t;
  setGlobalTopic();
}

function setGlobalTopic() {
  const t = document.getElementById('globalTopic').value.trim();
  if (!t) {
    document.getElementById('globalTopic').style.borderColor = 'var(--red)';
    setTimeout(() => { document.getElementById('globalTopic').style.borderColor = ''; }, 1500);
    return;
  }
  globalTopic = t;
  document.getElementById('testTopic').value = t;
  const impUnitEl = document.getElementById('impUnit');
  if (impUnitEl) impUnitEl.value = t;
  document.getElementById('resTopic').value = t;
  document.getElementById('sumTopic').value = t;
  document.getElementById('fcTopic').value = t;
  showToast(`Topic set: ${t}`);
}

function showToast(msg) {
  const d = document.createElement('div');
  d.textContent = msg;
  Object.assign(d.style, {
    position: 'fixed', bottom: '2rem', right: '2rem',
    background: 'var(--ink)', color: 'var(--bg)',
    padding: '10px 18px', borderRadius: '8px',
    fontSize: '0.82rem', fontWeight: '600', zIndex: '9999',
    animation: 'fadeUp 0.3s ease', boxShadow: 'var(--shadow-lg)'
  });
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2500);
}

function toggleSection(bodyId, chevId) {
  const b = document.getElementById(bodyId);
  const c = document.getElementById(chevId);
  b.classList.toggle('open');
  c.classList.toggle('open');
}

function setDoubt(prefix) {
  const q = document.getElementById('doubtQ');
  q.value = prefix + (globalTopic ? ` about ${globalTopic}` : '');
  q.focus();
}

function setSumType(el) {
  document.querySelectorAll('.sum-btn[data-sumtype]').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  currentSumType = el.dataset.sumtype;
}

function switchResTab(tab, el) {
  document.querySelectorAll('.res-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.res-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('res-' + tab).classList.add('active');
}

function formatProse(text) {
  let html = text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/---/g, '<hr>');

  // Group list items into single <ul> blocks
  html = html.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(?:<li>.*?<\/li>\s*)+/gs, match => `<ul>${match.trim()}</ul>`);
  
  html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return html;
}

function openLink(url) {
  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = 'https://' + target;
  }
  window.open(target, '_blank');
}

// ─── UNIFIED DISPATCHER WITH PROFILE CONTEXT ───
async function callAI(prompt, streamEl = null, loaderId = null, isJson = false) {
  const provider = localStorage.getItem('ai_provider') || 'mock';
  const apiKey = localStorage.getItem('ai_apikey') || '';
  
  // Student Profile details
  const name = localStorage.getItem('stud_name');
  const cls = localStorage.getItem('stud_class');
  const board = localStorage.getItem('stud_board');
  const med = localStorage.getItem('stud_medium');
  const target = localStorage.getItem('stud_target');
  const school = localStorage.getItem('stud_school');
  
  let contextPrefix = '';
  if (name && cls && board) {
    contextPrefix = `[Indian Curriculum Context: Student is in ${cls}, studying in ${board} Board (${med} Medium) at school: ${school || 'Indian School'}. Primary exam target: ${target}. Tailor your answers to the Indian syllabus standards (NCERT benchmarks, CBSE/ICSE grading/marking rules, descriptive structures). Match terminology with standard Indian textbooks]. `;
  }
  
  const tailoredPrompt = contextPrefix + prompt;
  
  if (provider === 'mock') {
    return await callMock(prompt, streamEl, loaderId, isJson); // Call mock with original prompt to parse matches
  }
  
  if (provider === 'gemini') {
    if (!apiKey) {
      showToast('⚠️ Gemini API Key missing! Set it in Settings.');
      openSettings();
      throw new Error('API Key missing');
    }
    return await callGemini(apiKey, tailoredPrompt, streamEl, loaderId, isJson);
  }
  
  if (provider === 'claude') {
    if (!apiKey) {
      showToast('⚠️ Claude API Key missing! Set it in Settings.');
      openSettings();
      throw new Error('API Key missing');
    }
    const proxy = localStorage.getItem('ai_proxy') || '';
    return await callClaude(apiKey, proxy, tailoredPrompt, streamEl, loaderId, isJson);
  }
}

// ─── GOOGLE GEMINI API ───
async function callGemini(apiKey, prompt, streamEl, loaderId, isJson) {
  if (loaderId) document.getElementById(loaderId).classList.add('visible');
  
  const config = isJson ? { responseMimeType: "application/json" } : {};
  const model = "gemini-1.5-flash";
  
  try {
    if (streamEl) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: config
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';
      let full = '';
      streamEl.innerHTML = '<span class="cursor"></span>';
      streamEl.style.display = 'block'; streamEl.classList.add('visible');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value);
        
        const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        let match;
        let tempText = '';
        while ((match = regex.exec(buffer)) !== null) {
          try {
            tempText += JSON.parse(`"${match[1]}"`);
          } catch(e) {}
        }
        full = tempText;
        streamEl.innerHTML = formatProse(full) + '<span class="cursor"></span>';
      }
      
      streamEl.innerHTML = formatProse(full);
      if (loaderId) document.getElementById(loaderId).classList.remove('visible');
      return full;
    } else {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: config
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (loaderId) document.getElementById(loaderId).classList.remove('visible');
      return text;
    }
  } catch (e) {
    if (loaderId) document.getElementById(loaderId).classList.remove('visible');
    throw e;
  }
}

// ─── ANTHROPIC CLAUDE API ───
async function callClaude(apiKey, proxy, prompt, streamEl, loaderId, isJson) {
  if (loaderId) document.getElementById(loaderId).classList.add('visible');
  
  const baseUrl = proxy ? proxy.trim() : 'https://api.anthropic.com/v1/messages';
  const headers = { 'Content-Type': 'application/json' };
  
  if (!proxy) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-danger-externally-keyless-beta'] = 'true';
  } else {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }
  
  const body = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  };
  
  try {
    if (streamEl) {
      body.stream = true;
      const res = await fetch(baseUrl, {
        method: 'POST', headers: headers, body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = '';
      streamEl.innerHTML = '<span class="cursor"></span>';
      streamEl.style.display = 'block'; streamEl.classList.add('visible');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = dec.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.delta?.text) {
                full += d.delta.text;
                streamEl.innerHTML = formatProse(full) + '<span class="cursor"></span>';
              }
            } catch(e) {}
          }
        }
      }
      
      streamEl.innerHTML = formatProse(full);
      if (loaderId) document.getElementById(loaderId).classList.remove('visible');
      return full;
    } else {
      const res = await fetch(baseUrl, {
        method: 'POST', headers: headers, body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const text = data.content?.map(b => b.text || '').join('') || '';
      if (loaderId) document.getElementById(loaderId).classList.remove('visible');
      return text;
    }
  } catch (e) {
    if (loaderId) document.getElementById(loaderId).classList.remove('visible');
    throw e;
  }
}

// ─── DEMO / MOCK DISPATCHER ───
async function callMock(prompt, streamEl, loaderId, isJson) {
  if (loaderId) document.getElementById(loaderId).classList.add('visible');
  
  const delay = isJson ? 800 : 1200;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const impUnitEl = document.getElementById('impUnit');
  let topic = (impUnitEl && prompt.includes('syllabus unit')) ? impUnitEl.value.trim() : (globalTopic || document.getElementById('globalTopic').value.trim() || 'general');
  if (!topic) topic = 'general';
  let responseData = '';
  
  if (prompt.includes('personalized study and revision plan')) {
    responseData = getMockStudyPlan();
  } else if (prompt.includes('student has this doubt:')) {
    responseData = getMockDoubt(topic);
  } else if (prompt.includes('MCQ') || (prompt.includes('quiz') && isJson)) {
    responseData = JSON.stringify(getMockQuiz(topic, prompt));
  } else if (prompt.includes('likely_questions') && isJson) {
    responseData = JSON.stringify(getMockImportant(topic));
  } else if (prompt.includes('study resource recommendations')) {
    responseData = JSON.stringify(getMockResources(topic));
  } else if (prompt.includes('revision brief') || prompt.includes('revision summary') || prompt.includes('chapter outline') || prompt.includes('mind map') || prompt.includes('compare & contrast')) {
    responseData = getMockSummary(topic, currentSumType);
  } else if (prompt.includes('flashcards') && isJson) {
    responseData = JSON.stringify(getMockFlashcards(topic));
  } else {
    responseData = `Mock data for **${topic}**. Configure your Gemini Key in Settings to get live customized responses.`;
  }
  
  if (loaderId) document.getElementById(loaderId).classList.remove('visible');
  
  if (streamEl) {
    streamEl.innerHTML = '<span class="cursor"></span>';
    streamEl.style.display = 'block'; streamEl.classList.add('visible');
    
    const words = responseData.split(' ');
    let textTyped = '';
    
    for (let i = 0; i < words.length; i++) {
      textTyped += words[i] + ' ';
      streamEl.innerHTML = formatProse(textTyped) + '<span class="cursor"></span>';
      
      const speed = (words[i].includes('\n') || words[i].includes('.')) ? 100 : 15;
      await new Promise(res => setTimeout(res, speed));
    }
    
    streamEl.innerHTML = formatProse(responseData);
    return responseData;
  }
  
  return responseData;
}

// ─── 1. DOUBT SOLVER ───
async function solveDoubt() {
  const q = document.getElementById('doubtQ').value.trim();
  if (!q) {
    document.getElementById('doubtQ').style.borderColor = 'var(--red)';
    setTimeout(() => { document.getElementById('doubtQ').style.borderColor = ''; }, 1500);
    return;
  }
  const topic = globalTopic ? `The student is studying: ${globalTopic}. ` : '';
  const prompt = `${topic}A student has this doubt: "${q}"\n\nExplain clearly and concisely in an exam-friendly way. Use:\n- Simple language\n- Step-by-step if needed\n- A real-world analogy if helpful\n- End with a 1-line exam tip\n\nKeep it under 300 words. Use **bold** for key terms and ## for section headers.`;
  
  document.getElementById('doubtBtn').disabled = true;
  const out = document.getElementById('doubtAnswer');
  out.classList.add('visible');
  out.innerHTML = '';
  
  try {
    await callAI(prompt, out, 'doubtLoading');
  } catch (e) {
    showToast('Failed to solve doubt.');
  } finally {
    document.getElementById('doubtBtn').disabled = false;
  }
}

// ─── 2. QUICK TEST ───
let testData = []; let testAnswered = 0; let testScore = 0;

async function generateTest() {
  const topic = document.getElementById('testTopic').value.trim() || globalTopic;
  if (!topic) { showToast('Please enter a topic!'); return; }
  
  const diff = document.getElementById('testDiff').value;
  const count = parseInt(document.getElementById('testCount').value) || 5;
  
  document.getElementById('testBtn').disabled = true;
  document.getElementById('quizWrap').classList.remove('visible');
  document.getElementById('testResult').classList.remove('visible');
  testAnswered = 0; testScore = 0; testData = [];
  
  const prompt = `Create a ${count}-question ${diff} difficulty multiple choice quiz on: "${topic}".\nRESPOND ONLY WITH VALID JSON. No markdown, no backticks, no extra text.\n{"questions":[{"q":"question","options":["A","B","C","D"],"answer":0,"explanation":"why correct"}]}\nanswer = 0-based index of correct option.`;
  
  try {
    const raw = await callAI(prompt, null, 'testLoading', true);
    const clean = raw.replace(/```json|```/g, '').trim();
    testData = JSON.parse(clean).questions || [];
    renderTest();
    document.getElementById('quizWrap').classList.add('visible');
  } catch (e) {
    showToast('Could not generate test. Try again.');
  } finally {
    document.getElementById('testBtn').disabled = false;
  }
}

function renderTest() {
  const wrap = document.getElementById('quizWrap');
  wrap.innerHTML = testData.map((q, i) => `
    <div class="q-card" id="qcard${i}">
      <div class="q-num">Question ${i + 1} of ${testData.length}</div>
      <div class="q-text">${q.q}</div>
      <div class="q-opts">
        ${q.options.map((o, j) => `<button class="q-opt" id="opt${i}_${j}" onclick="answerQ(${i},${j})">${String.fromCharCode(65 + j)}. ${o}</button>`).join('')}
      </div>
      <div class="q-expl" id="expl${i}">💡 ${q.explanation}</div>
    </div>`).join('');
}

function answerQ(qi, oi) {
  const q = testData[qi];
  for (let j = 0; j < q.options.length; j++) {
    const btn = document.getElementById(`opt${qi}_${j}`);
    btn.disabled = true;
    if (j === q.answer) btn.classList.add('correct');
    else if (j === oi && j !== q.answer) btn.classList.add('wrong');
  }
  document.getElementById(`expl${qi}`).style.display = 'block';
  if (oi === q.answer) testScore++;
  testAnswered++;
  
  if (testAnswered === testData.length) {
    setTimeout(() => {
      const pct = Math.round((testScore / testData.length) * 100);
      document.getElementById('resultScore').textContent = `${testScore}/${testData.length}`;
      const grades = ['Needs more study 📚', 'Getting there 🙌', 'Good job 👍', 'Almost perfect 🔥', 'Brilliant! 🏆'];
      const gi = pct < 40 ? 0 : pct < 60 ? 1 : pct < 75 ? 2 : pct < 90 ? 3 : 4;
      document.getElementById('resultGrade').textContent = `${pct}% correct — ${grades[gi]}`;
      document.getElementById('testResult').classList.add('visible');
    }, 600);
  }
}

function resetTest() {
  document.getElementById('testResult').classList.remove('visible');
  document.getElementById('quizWrap').classList.remove('visible');
}

// ─── 3. IMPORTANT TOPICS ───
async function analyseImportant() {
  const unit = document.getElementById('impUnit').value.trim() || globalTopic;
  if (!unit) { showToast('Enter a unit name to analyse!'); return; }
  
  document.getElementById('impBtn').disabled = true;
  document.getElementById('impGrid').innerHTML = '';
  document.getElementById('impQuestions').innerHTML = '';
  
  const prompt = `Analyze the syllabus unit "${unit}" to suggest key topics with high probability to be asked in the exam. Respond ONLY in valid JSON:
{"topics":[{"title":"Topic Name","description":"Why this specific topic has a high probability of being asked in exams","probability":"High/Medium/Low","priority":"high/med/low","tip":"1 actionable exam tip for this topic"}],"likely_questions":["Question 1","Question 2","Question 3","Question 4","Question 5"]}
Include 5-8 topics total, focusing on high-probability concepts in this unit. likely_questions = 5 most expected exam questions for this unit.`;
  
  try {
    const raw = await callAI(prompt, null, 'impLoading', true);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    renderImportant(parsed);
  } catch (e) {
    showToast('Analysis failed. Try again.');
  } finally {
    document.getElementById('impBtn').disabled = false;
  }
}

function renderImportant(data) {
  const grid = document.getElementById('impGrid');
  grid.innerHTML = (data.topics || []).map(t => `
    <div class="imp-card ${t.priority}">
      <div class="imp-card-tag">${t.probability} probability</div>
      <div class="imp-card-title">${t.title}</div>
      <div class="imp-card-desc">${t.description}</div>
      <div class="imp-card-prob">💡 ${t.tip}</div>
    </div>`).join('');
    
  if (data.likely_questions?.length) {
    document.getElementById('impQuestions').innerHTML = `
      <div style="margin-top:1.25rem;">
        <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:0.75rem;">🎯 Most Likely Exam Questions</div>
        ${data.likely_questions.map((q, i) => `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:0.7rem 1rem;margin-bottom:0.5rem;font-size:0.88rem;"><strong style="color:var(--ink3);font-size:0.75rem;">Q${i + 1}</strong> ${q}</div>`).join('')}
      </div>`;
  }
}

// ─── 4. RESOURCES ───
async function findResources() {
  const topic = document.getElementById('resTopic').value.trim() || globalTopic;
  if (!topic) { showToast('Enter a topic!'); return; }
  
  document.getElementById('resBtn').disabled = true;
  document.getElementById('resContent').style.display = 'none';
  
  const prompt = `For the exam topic "${topic}", generate realistic study resource recommendations in JSON:\n{"videos":[{"title":"video title","channel":"channel name","duration":"X min","level":"Beginner/Intermediate","emoji":"🎬","color":"#f0f5fd","tag":"Summary Video"}],"ppts":[{"title":"ppt title","source":"website","slides":"XX slides","emoji":"📊","color":"#f7f3fd","tag":"PPT Slides"}],"notes":[{"title":"notes title","source":"source","pages":"X pages","emoji":"📄","color":"#f0faf4","tag":"Study Notes"}],"links":[{"title":"resource name","url":"https://...","description":"what it covers","emoji":"🔗"}]}\nProvide 4 items in each category. Make titles specific and realistic for the topic. For links use educational domains.`;
  
  try {
    const raw = await callAI(prompt, null, 'resLoading', true);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    renderResources(parsed, topic);
    document.getElementById('resContent').style.display = 'block';
  } catch (e) {
    showToast('Could not find resources. Try again.');
  } finally {
    document.getElementById('resBtn').disabled = false;
  }
}

function renderResources(data, topic) {
  const videoHtml = data.videos?.map(v => `
    <div class="res-card" onclick="showToast('Searching YouTube for: ${v.title.replace(/'/g, "\\'")}')">
      <div class="res-thumb" style="background:${v.color || '#f0f5fd'}">${v.emoji || '🎬'}</div>
      <div class="res-card-body">
        <div class="res-card-tag" style="background:#f0f5fd;color:var(--blue);">${v.tag}</div>
        <div class="res-card-title">${v.title}</div>
        <div class="res-card-meta">${v.channel} · ${v.duration} · ${v.level}</div>
      </div>
    </div>`).join('') || '<p style="color:var(--ink3);font-size:0.85rem;">No videos found.</p>';

  const pptHtml = data.ppts?.map(p => `
    <div class="res-card" onclick="showToast('Searching SlideShare for: ${p.title.replace(/'/g, "\\'")}')">
      <div class="res-thumb" style="background:${p.color || '#f7f3fd'}">${p.emoji || '📊'}</div>
      <div class="res-card-body">
        <div class="res-card-tag" style="background:#f7f3fd;color:var(--purple);">${p.tag}</div>
        <div class="res-card-title">${p.title}</div>
        <div class="res-card-meta">${p.source} · ${p.slides}</div>
      </div>
    </div>`).join('') || '';

  const notesHtml = data.notes?.map(n => `
    <div class="res-card" onclick="showToast('Searching Notes: ${n.title.replace(/'/g, "\\'")}')">
      <div class="res-thumb" style="background:${n.color || '#f0faf4'}">${n.emoji || '📄'}</div>
      <div class="res-card-body">
        <div class="res-card-tag" style="background:#f0faf4;color:var(--green);">${n.tag}</div>
        <div class="res-card-title">${n.title}</div>
        <div class="res-card-meta">${n.source} · ${n.pages}</div>
      </div>
    </div>`).join('') || '';

  const linksHtml = data.links?.map(l => `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:0.9rem 1.1rem;margin-bottom:0.6rem;cursor:pointer;transition:box-shadow 0.15s;" onclick="openLink('${l.url}')" onmouseover="this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.boxShadow='none'">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.25rem;">
        <span style="font-size:1.1rem;">${l.emoji || '🔗'}</span>
        <strong style="font-size:0.88rem;">${l.title}</strong>
      </div>
      <div style="font-size:0.78rem;color:var(--ink3);">${l.description}</div>
      <div style="font-size:0.72rem;color:var(--blue);margin-top:0.3rem;">${l.url}</div>
    </div>`).join('') || '';

  document.getElementById('res-videos').innerHTML = `<div class="res-grid">${videoHtml}</div>`;
  document.getElementById('res-ppts').innerHTML = `<div class="res-grid">${pptHtml}</div>`;
  document.getElementById('res-notes').innerHTML = `<div class="res-grid">${notesHtml}</div>`;
  document.getElementById('res-links').innerHTML = linksHtml;
}

// ─── 5. SMART SUMMARY ───
async function generateSummary() {
  const topic = document.getElementById('sumTopic').value.trim() || globalTopic;
  if (!topic) { showToast('Enter a topic!'); return; }
  
  const types = {
    brief: `Write a 60-second revision brief for "${topic}". Cover only the most essential concepts, definitions, and 3 key facts. Bold key terms. Under 200 words.`,
    detailed: `Write a detailed exam revision summary for "${topic}". Include: key concepts, important definitions, processes/mechanisms, examples, and exam tips. Use ## headings. Bold key terms. Under 500 words.`,
    outline: `Create a structured chapter outline for "${topic}". Organize as numbered main sections with sub-points. Show hierarchy clearly. Include what a student must know at each level.`,
    mindmap: `Create a text-based mind map for "${topic}". Use indentation to show hierarchy:\n[MAIN TOPIC]\n  → Branch 1\n    • Sub-point\n    • Sub-point\n  → Branch 2\nCover all key areas.`,
    compare: `Create a compare & contrast analysis for the key elements/concepts in "${topic}". Use ## for each comparison. Show similarities and differences clearly. Great for exam answers.`
  };
  
  document.getElementById('sumBtn').disabled = true;
  const out = document.getElementById('sumOutput');
  out.classList.remove('visible');
  out.innerHTML = '';
  
  try {
    await callAI(types[currentSumType], out, 'sumLoading');
  } catch (e) {
    showToast('Failed to generate summary.');
  } finally {
    document.getElementById('sumBtn').disabled = false;
  }
}

// ─── 6. FLASHCARDS ───
async function generateFlashcards() {
  const topic = document.getElementById('fcTopic').value.trim() || globalTopic;
  if (!topic) { showToast('Enter a topic!'); return; }
  
  document.getElementById('fcBtn').disabled = true;
  document.getElementById('fcWrap').style.display = 'none';
  
  const prompt = `Create exactly 10 exam flashcards for "${topic}". Respond ONLY in valid JSON:\n{"cards":[{"front":"short question or term","back":"clear answer or definition"}]}\nMake questions exam-style: definitions, processes, formulas, dates, causes/effects. Keep answers concise (under 50 words each).`;
  
  try {
    const raw = await callAI(prompt, null, 'fcLoading', true);
    const clean = raw.replace(/```json|```/g, '').trim();
    fcData = JSON.parse(clean).cards || [];
    fcIndex = 0; fcFlipped = false;
    renderFC();
    document.getElementById('fcWrap').style.display = 'block';
  } catch (e) {
    showToast('Could not create flashcards. Try again.');
  } finally {
    document.getElementById('fcBtn').disabled = false;
  }
}

function renderFC() {
  if (!fcData.length) return;
  const card = document.getElementById('fcCard');
  card.classList.remove('flipped');
  fcFlipped = false;
  document.getElementById('fcFront').textContent = fcData[fcIndex].front;
  document.getElementById('fcBack').textContent = fcData[fcIndex].back;
  document.getElementById('fcProgress').textContent = `Card ${fcIndex + 1} of ${fcData.length}`;
}

function flipCard() {
  document.getElementById('fcCard').classList.toggle('flipped');
  fcFlipped = !fcFlipped;
}

function nextCard() {
  if (!fcData.length) return;
  fcIndex = (fcIndex + 1) % fcData.length;
  renderFC();
}

function prevCard() {
  if (!fcData.length) return;
  fcIndex = (fcIndex - 1 + fcData.length) % fcData.length;
  renderFC();
}

// ─── LOCAL DATABASE GETTERS (For Offline Demo Mode) ───
function getNormalizedTopic(topic) {
  const t = topic.toLowerCase().trim();
  if (t.includes('photosynthesis')) return 'photosynthesis';
  if (t.includes('world war') || t.includes('wwii') || t.includes('ww2')) return 'wwii';
  if (t.includes('quadratic')) return 'quadratic';
  if (t.includes('newton') || t.includes('law of motion') || t.includes('laws of motion')) return 'newton';
  if (t.includes('cell biology') || t.includes('mitosis') || t.includes('meiosis') || t.includes('cell division')) return 'cell';
  if (t.includes('organic chemistry') || t.includes('carbon') || t.includes('hydrocarbon')) return 'organic';
  if (t.includes('indian history') || t.includes('gandhi') || t.includes('independence')) return 'indian';
  if (t.includes('macroeconomics') || t.includes('inflation') || t.includes('gdp')) return 'macro';
  return 'fallback';
}

function getMockDoubt(topic) {
  const key = getNormalizedTopic(topic);
  const board = localStorage.getItem('stud_board') || 'CBSE';
  const cls = localStorage.getItem('stud_class') || 'Class 10';
  const med = localStorage.getItem('stud_medium') || 'English';
  
  const doubts = {
    photosynthesis: `## Understanding **Photosynthesis**

Photosynthesis is the biological process where plants, algae, and cyanobacteria convert light energy into chemical energy (glucose) using water and carbon dioxide.

### The Two Major Stages:
1. **Light-Dependent Reactions**: Occur in the thylakoid membranes of chloroplasts. Chlorophyll absorbs solar energy to split water molecules ($H_2O$), releasing oxygen ($O_2$) and creating ATP and NADPH.
2. **Light-Independent Reactions (Calvin Cycle)**: Occur in the stroma. The ATP and NADPH generated in the light reactions are used to fix carbon dioxide ($CO_2$) into glucose ($C_6H_{12}O_6$).

### Real-Life Analogy
Think of the chloroplast like a **solar-powered bakery**. The sun is the electricity, water and CO2 are the raw ingredients (flour and sugar), and glucose is the baked bread. Oxygen is just the steam/waste escaping from the bakery!

💡 **Exam Tip**: Under the **${board}** standard syllabus for **${cls}**, the balanced chemical equation is highly graded. Write: **$6CO_2 + 6H_2O \\xrightarrow{\\text{light}} C_6H_{12}O_6 + 6O_2$** in descriptive answers.`,
    
    wwii: `## Understanding **World War II (1939 - 1945)**

World War II was the deadliest global conflict in history, fought between the **Allied Powers** (UK, Soviet Union, USA, China) and the **Axis Powers** (Germany, Japan, Italy).

### Core Causes (M-A-I-N):
1. **Treaty of Versailles**: Extremely harsh terms imposed on Germany after WWI left its economy in ruins and fostered deep resentment.
2. **Rise of Fascism**: Aggressive expansionist nationalism in Nazi Germany under Hitler, fascist Italy under Mussolini, and militarist Japan.
3. **Appeasement Policy**: Britain and France failed to stop Hitler's early aggressions (e.g., annexation of Austria and Czechoslovakia) hoping to avoid war.
4. **Immediate Trigger**: Germany's invasion of Poland on **September 1, 1939**, which forced Britain and France to declare war.

### Real-Life Analogy
Think of WWII like a **massive pressure cooker** that had been boiling since WWI. The Treaty of Versailles blocked the steam valve. Fascist expansion raised the heat. Appeasement was like ignoring the warning whistles, until Poland's invasion finally caused the entire cooker to explode.

💡 **Exam Tip**: In **${board}** history exams, always mention the **Treaty of Versailles (1919)** as the foundational catalyst that paved the path for Adolf Hitler's rise to power.`,

    quadratic: `## Mastering **Quadratic Equations**

A quadratic equation is a second-degree polynomial equation in a single variable, written in the standard form: **$ax^2 + bx + c = 0$**, where $a \\neq 0$.

### Methods to Solve:
1. **Factoring (Splitting the Middle Term)**: Finding two numbers that multiply to $ac$ and add to $b$.
2. **Quadratic Formula**: The universal solution: **$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$**.
3. **Completing the Square**: Transforming the equation into a perfect square trinomial.

### The Discriminant ($\\Delta = b^2 - 4ac$):
- If $\\Delta > 0$: Two distinct real roots.
- If $\\Delta = 0$: One repeated real root (perfect square).
- If $\\Delta < 0$: Two complex/imaginary roots.

### Real-Life Analogy
Think of a quadratic equation like the **trajectory of a basketball thrown at a hoop**. The path is a parabola. Finding the roots ($x$-intercepts) is like finding the exact points where the ball leaves the player's hand and hits the floor.

💡 **Exam Tip**: For **${board} ${cls}** math tests, if the question asks for the "nature of roots", don't solve the whole equation! Just calculate $b^2 - 4ac$ and state the nature based on its sign.`,

    newton: `## Demystifying **Newton's Laws of Motion**

Isaac Newton formulated three fundamental laws that describe the relationship between a body and the forces acting upon it.

### The Three Laws:
1. **First Law (Law of Inertia)**: An object at rest stays at rest, and an object in motion stays in motion at a constant velocity, unless acted upon by a net external force. (e.g., sliding forward when brakes are applied).
2. **Second Law ($F = ma$)**: The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. (e.g., pushing an empty shopping cart is easier than a full one).
3. **Third Law (Action-Reaction)**: For every action, there is an equal and opposite reaction. (e.g., when a rocket burns fuel downwards, the reaction pushes the rocket upwards).

### Real-Life Analogy
Think of inertia like a **stubborn teenager**. If they are asleep in bed, they want to stay asleep (rest). If they are playing video games, they want to keep playing (motion). It takes a major external force (a parent shouting) to change their state!

💡 **Exam Tip**: In **${board} ${cls}** physics numericals, always draw a **Free Body Diagram (FBD)** before formulating equations using the Second Law. Mass is the quantitative measure of Inertia.`
  };
  
  if (doubts[key]) return doubts[key];
  
  // Custom topic fallback
  return `## Understanding **${topic}**

**${topic}** is a core syllabus topic. To write high-scoring answers, let's break it down into its critical components.

### Key Conceptual Pillars
1. **Core Concept**: The fundamental mechanism of **${topic}** relies on how elements interact within the system.
2. **Key Variables**: Changing the environmental inputs directly modifies the rate and efficiency of this process.
3. **Primary Application**: In practical exams, this concept is commonly used to calculate efficiency, observe changes under variable states, or design robust models.

### Real-Life Analogy
Think of **${topic}** like a **geared bicycle**. The pedals represent the input energy, the gears represent the internal variables, and the wheels spinning represent the final output. Adjusting the gears (parameters) determines how much force is needed to achieve speed.

💡 **Exam Tip**: In **${board} ${cls}** examinations, drawing a clear flowchart showing the relationships between inputs and outputs will secure maximum descriptive marks.`;
}

function getMockQuiz(topic, prompt) {
  const key = getNormalizedTopic(topic);
  const countMatch = prompt.match(/(\d+)-question/);
  const count = countMatch ? parseInt(countMatch[1]) : 5;
  
  const quizzes = {
    photosynthesis: {
      questions: [
        {
          q: "Which pigment primarily absorbs light during photosynthesis?",
          options: ["Carotenoids", "Chlorophyll a", "Anthocyanin", "Phycobilin"],
          answer: 1,
          explanation: "Chlorophyll a is the principal pigment involved in photosynthesis, absorbing blue-violet and red light."
        },
        {
          q: "Where do the light-independent reactions (Calvin Cycle) take place?",
          options: ["Thylakoid membrane", "Stromal lamellae", "Stroma", "Mitochondrial matrix"],
          answer: 2,
          explanation: "The Calvin Cycle takes place in the stroma of the chloroplast, where enzyme Rubisco is located."
        },
        {
          q: "Which molecule is split during the light reactions to release oxygen?",
          options: ["Carbon dioxide", "Water", "Glucose", "ATP"],
          answer: 1,
          explanation: "Water (H2O) is photolyzed (split by light) during the light-dependent reactions to replace electrons in PS II, releasing O2 gas."
        },
        {
          q: "What are the primary products of the light-dependent reactions used in the Calvin Cycle?",
          options: ["ATP and NADPH", "ADP and NADP+", "Glucose and Oxygen", "Carbon dioxide and Water"],
          answer: 0,
          explanation: "ATP and NADPH are the chemical energy carriers produced in the light reactions and consumed in the stroma to fix carbon."
        },
        {
          q: "What is the key enzyme that catalyzes carbon fixation in the Calvin Cycle?",
          options: ["Amylase", "ATP Synthase", "Rubisco", "PEP Carboxylase"],
          answer: 2,
          explanation: "Rubisco (ribulose-1,5-bisphosphate carboxylase-oxygenase) is the enzyme responsible for fixing inorganic CO2 into organic molecules."
        }
      ]
    },
    wwii: {
      questions: [
        {
          q: "On which date did Germany invade Poland, triggering World War II?",
          options: ["September 1, 1939", "December 7, 1941", "June 6, 1944", "May 8, 1945"],
          answer: 0,
          explanation: "Germany invaded Poland on September 1, 1939, leading Britain and France to declare war two days later."
        },
        {
          q: "Which three main countries formed the Axis Powers alliance?",
          options: ["UK, France, Russia", "Germany, Japan, Italy", "USA, UK, China", "Germany, Russia, Japan"],
          answer: 1,
          explanation: "Germany, Japan, and Italy signed the Tripartite Pact in 1940, officially forming the Axis coalition."
        },
        {
          q: "What event prompted the United States to officially enter World War II?",
          options: ["The invasion of Poland", "The Battle of Britain", "The bombing of Pearl Harbor", "The signing of the Munich Agreement"],
          answer: 2,
          explanation: "Japan attacked Pearl Harbor on December 7, 1941, leading the US to declare war on Japan the following day."
        },
        {
          q: "What was the codename for the Allied invasion of Normandy on June 6, 1944?",
          options: ["Operation Barbarossa", "Operation Overlord (D-Day)", "Operation Sea Lion", "Operation Torch"],
          answer: 1,
          explanation: "Operation Overlord, commonly known as D-Day, opened a major second front in Western Europe."
        },
        {
          q: "Which international organization was created immediately after WWII to prevent future global conflicts?",
          options: ["League of Nations", "United Nations", "NATO", "European Union"],
          answer: 1,
          explanation: "The United Nations was established in 1945 to replace the ineffective League of Nations and foster international cooperation."
        }
      ]
    },
    quadratic: {
      questions: [
        {
          q: "What is the discriminant of the quadratic equation $ax^2 + bx + c = 0$?",
          options: ["$b^2 + 4ac$", "$\\sqrt{b^2 - 4ac}$", "$b^2 - 4ac$", "$-b \\pm \\sqrt{b^2 - 4ac}$"],
          answer: 2,
          explanation: "The discriminant is denoted by $\\Delta = b^2 - 4ac$, which determines the nature of the roots."
        },
        {
          q: "If the discriminant of a quadratic equation is negative ($\\Delta < 0$), what is the nature of its roots?",
          options: ["Two real and equal roots", "Two real and unequal roots", "No real roots (Two complex roots)", "Infinite real roots"],
          answer: 2,
          explanation: "A negative discriminant means taking the square root of a negative number, resulting in complex/imaginary roots."
        },
        {
          q: "Find the roots of the quadratic equation $x^2 - 5x + 6 = 0$.",
          options: ["$x = 1, 6$", "$x = 2, 3$", "$x = -2, -3$", "$x = -1, -6$"],
          answer: 1,
          explanation: "Factorizing gives $(x-2)(x-3) = 0$, so $x=2$ and $x=3$ are the roots."
        },
        {
          q: "What is the sum of the roots of a quadratic equation $ax^2 + bx + c = 0$?",
          options: ["$c/a$", "$-b/a$", "$b/a$", "$-c/a$"],
          answer: 1,
          explanation: "By Vieta's formulas, the sum of the roots is equal to $-b/a$."
        },
        {
          q: "What is the product of the roots of a quadratic equation $ax^2 + bx + c = 0$?",
          options: ["$c/a$", "$-b/a$", "$b/a$", "$d/a$"],
          answer: 0,
          explanation: "By Vieta's formulas, the product of the roots is equal to $c/a$."
        }
      ]
    },
    newton: {
      questions: [
        {
          q: "Which law is also referred to as the 'Law of Inertia'?",
          options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Universal Gravitation"],
          answer: 0,
          explanation: "Newton's First Law states that objects resist changes in their motion, which is the definition of inertia."
        },
        {
          q: "If you push an object with a constant net force, and its mass is doubled, what happens to its acceleration?",
          options: ["It is doubled", "It is halved", "It remains the same", "It becomes four times greater"],
          answer: 1,
          explanation: "Since $F = ma$, acceleration is $a = F/m$. Doubling the mass ($2m$) halves the acceleration."
        },
        {
          q: "A swimmer pushes back against the water to move forward. Which law does this illustrate?",
          options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Conservation of Energy"],
          answer: 2,
          explanation: "The swimmer pushing the water back (action) leads to the water pushing the swimmer forward (reaction), illustrating the Third Law."
        },
        {
          q: "What is the SI unit of force?",
          options: ["Joule", "Watt", "Pascal", "Newton"],
          answer: 3,
          explanation: "The Newton (N) is the SI unit of force, defined as $1 \\text{ kg} \\cdot \\text{m/s}^2$."
        },
        {
          q: "Which of the following is a contact force?",
          options: ["Gravitational force", "Magnetic force", "Frictional force", "Electrostatic force"],
          answer: 2,
          explanation: "Friction requires physical contact between two surfaces, unlike gravity or magnetism which act at a distance."
        }
      ]
    }
  };
  
  let qData = quizzes[key] || {
    questions: [
      {
        q: `What is the primary conceptual basis of ${topic}?`,
        options: [
          "It represents the total resistance of the medium",
          "It is a core structural and functional framework of this system",
          "It is a temporary transition state of minimal energy",
          "It is a mathematical abstraction with no real physical basis"
        ],
        answer: 1,
        explanation: `${topic} is defined as a core structural and functional framework that organizes the elements of this system.`
      },
      {
        q: `Which of the following is most critical for optimizing the rate of ${topic}?`,
        options: [
          "Eliminating all external catalysts and heating",
          "Maintaining equilibrium of variables and using specific activators",
          "Reducing surface area to minimal values",
          "Isolating the system from any thermodynamic transfer"
        ],
        answer: 1,
        explanation: `Optimizing ${topic} requires maintaining balance in variables and providing active triggers or catalysts.`
      },
      {
        q: `What constitutes a common student error when analyzing ${topic} in exams?`,
        options: [
          "Forgetting to include units and state factors in calculations",
          "Drawing flow schematics with backwards arrows",
          "Confusing the inputs with the outputs",
          "All of the above"
        ],
        answer: 3,
        explanation: `Students frequently make all of these mistakes, making it crucial to write step-by-step solutions carefully.`
      },
      {
        q: `How is the efficiency or yield of a ${topic} process mathematically represented?`,
        options: [
          "Output energy minus input energy",
          "(Output divided by Input) times 100",
          "The sum of all variables in the system",
          "A constant coefficient value equal to 1.0"
        ],
        answer: 1,
        explanation: `Efficiency is always calculated as the ratio of useful output to total input, expressed as a percentage.`
      },
      {
        q: `Which scientist or theory is historically credited with defining the foundational rules of ${topic}?`,
        options: [
          "Isaac Newton's Classic Mechanics",
          "The leading modern consensus and research pioneers in this field",
          "Albert Einstein's General Relativity",
          "Gregor Mendel's Laws of Heredity"
        ],
        answer: 1,
        explanation: `The foundational rules of ${topic} were established by early pioneers and refined by contemporary researchers.`
      }
    ]
  };
  
  return { questions: qData.questions.slice(0, count) };
}

function getMockImportant(topic) {
  const key = getNormalizedTopic(topic);
  const data = {
    photosynthesis: {
      topics: [
        {
          title: "Light Reactions & Photolysis",
          description: "Splitting of water molecules at Photosystem II to release oxygen and electrons.",
          probability: "High",
          priority: "high",
          tip: "Remember that light reactions happen in the thylakoid membrane and produce ATP/NADPH."
        },
        {
          title: "Calvin Cycle (Dark Reactions)",
          description: "Fixation of CO2 in the stroma using Rubisco to synthesize glucose.",
          probability: "High",
          priority: "high",
          tip: "Be prepared to draw a simple cycle diagram showing Carbon Fixation, Reduction, and Regeneration."
        },
        {
          title: "Factors Affecting Photosynthesis",
          description: "How light intensity, temperature, and CO2 concentration act as limiting factors.",
          probability: "Medium",
          priority: "med",
          tip: "Review Blackman's Law of Limiting Factors and read the corresponding graph."
        },
        {
          title: "Chloroplast Structure",
          description: "Double membrane organelle containing grana, thylakoids, and stroma.",
          probability: "Medium",
          priority: "med",
          tip: "Practice drawing a neat labeled diagram of a chloroplast; it is a common 3-mark question."
        },
        {
          title: "C3 vs C4 Pathways",
          description: "Different adaptations of plants to fix carbon under hot and dry conditions.",
          probability: "Low",
          priority: "low",
          tip: "Kranz anatomy in C4 plants separates light and dark reactions spatially to reduce photorespiration."
        }
      ],
      likely_questions: [
        "Explain the Z-scheme of light-dependent reactions in detail.",
        "Describe the three main phases of the Calvin Cycle (dark reactions).",
        "What is photorespiration and why is it considered wasteful?",
        "Explain how temperature and CO2 act as limiting factors on photosynthesis.",
        "Draw and label a detailed cross-section diagram of a chloroplast."
      ]
    },
    wwii: {
      topics: [
        {
          title: "Rise of Dictators & Appeasement",
          description: "How Chamberlain's appeasement policy and Hitler's aggressive expansions caused the war.",
          probability: "High",
          priority: "high",
          tip: "Be ready to critique the Munich Pact of 1938 and how Hitler breached it."
        },
        {
          title: "The Battle of Stalingrad",
          description: "The major turning point on the Eastern Front which stopped the German advance into Russia.",
          probability: "High",
          priority: "high",
          tip: "Highlight the winter conditions and urban warfare that exhausted the German 6th Army."
        },
        {
          title: "D-Day (Invasion of Normandy)",
          description: "Allied amphibious invasion opening the Western Front on June 6, 1944.",
          probability: "Medium",
          priority: "med",
          tip: "Mention the importance of deception plans (Operation Fortitude) in securing beachheads."
        },
        {
          title: "Consequences & Creation of UN",
          description: "The division of Germany, rise of USA and USSR as superpowers, and formation of the UN.",
          probability: "Medium",
          priority: "med",
          tip: "Explain how the UN security council was structured differently to solve the weaknesses of the League of Nations."
        },
        {
          title: "The Pacific Campaign & Pearl Harbor",
          description: "The atomic bombings of Hiroshima & Nagasaki, island hopping, and Pearl Harbor attack.",
          probability: "Low",
          priority: "low",
          tip: "Remember December 7, 1941, as the catalyst that brought American industrial might into the war."
        }
      ],
      likely_questions: [
        "Examine the failure of the League of Nations and how it contributed to the outbreak of WWII.",
        "Why was the Battle of Stalingrad considered the military turning point of WWII in Europe?",
        "Critically analyze the decision of the United States to use atomic weapons on Hiroshima and Nagasaki.",
        "Explain the causes and consequences of the attack on Pearl Harbor in 1941.",
        "Describe the structural differences between the League of Nations and the newly created United Nations."
      ]
    },
    quadratic: {
      topics: [
        {
          title: "Nature of Roots (Discriminant)",
          description: "Using $b^2 - 4ac$ to classify roots as real/unequal, real/equal, or complex.",
          probability: "High",
          priority: "high",
          tip: "If roots are real and equal, set the discriminant equal to zero to find unknown variables."
        },
        {
          title: "Quadratic Formula derivation and usage",
          description: "Using the quadratic formula to find roots for non-factorable equations.",
          probability: "High",
          priority: "high",
          tip: "Keep watch of negative signs under the radical. If negative, represent roots using $i$."
        },
        {
          title: "Vieta's Formulas (Sum & Product)",
          description: "Establishing coefficients relations: $\\alpha+\\beta = -b/a$ and $\\alpha\\beta = c/a$.",
          probability: "Medium",
          priority: "med",
          tip: "Use these formulas to form a new quadratic equation whose roots are given as functions of $\\alpha$ and $\\beta$."
        },
        {
          title: "Word Problems (Speed, Area, Work)",
          description: "Setting up quadratic equations from real-life mathematical scenarios.",
          probability: "Medium",
          priority: "med",
          tip: "Reject negative solutions if the problem involves physical values like time, distance, or dimensions."
        },
        {
          title: "Graphing Quadratic Parabolas",
          description: "Finding vertex coordinates $(-b/2a, -\\Delta/4a)$ and axis of symmetry.",
          probability: "Low",
          priority: "low",
          tip: "The graph opens upwards if $a > 0$ and downwards if $a < 0$."
        }
      ],
      likely_questions: [
        "Derive the quadratic formula by using the method of completing the square.",
        "Find the value of $k$ for which the equation $3x^2 + kx + 12 = 0$ has real and equal roots.",
        "The speed of a boat in still water is 15 km/h. It goes 30 km downstream and returns in 4.5 hours. Find speed of stream.",
        "If $\\alpha$ and $\\beta$ are roots of $x^2 - px + q = 0$, find the equation whose roots are $\\alpha^2$ and $\\beta^2$.",
        "Explain the nature of roots for $2x^2 - 4x + 3 = 0$ using the discriminant."
      ]
    },
    newton: {
      topics: [
        {
          title: "Newton's Second Law ($F = ma$)",
          description: "Solving force, mass, and acceleration problems, including elevator/pulley systems.",
          probability: "High",
          priority: "high",
          tip: "Always draw a Free Body Diagram (FBD) showing all acting force vectors before writing equations."
        },
        {
          title: "Law of Inertia & Conceptual Scenarios",
          description: "Explaining everyday situations (seatbelts, carpets, running starts) using inertia.",
          probability: "High",
          priority: "high",
          tip: "Differentiate between inertia of rest, inertia of motion, and inertia of direction in answers."
        },
        {
          title: "Action-Reaction & Recoil Velocity",
          description: "Understanding contact forces, rocket propulsion, and calculating gun recoil.",
          probability: "Medium",
          priority: "med",
          tip: "Remember action and reaction act on DIFFERENT bodies, which is why they never cancel each other out."
        },
        {
          title: "Friction as a Force",
          description: "Static, kinetic, and rolling friction, coefficients of friction, and limiting friction.",
          probability: "Medium",
          priority: "med",
          tip: "Remember that limiting static friction is always greater than kinetic sliding friction."
        },
        {
          title: "Conservation of Linear Momentum",
          description: "Total momentum before collision equals total momentum after, derived from 3rd Law.",
          probability: "Low",
          priority: "low",
          tip: "Use the formula $m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$ for elastic and inelastic collisions."
        }
      ],
      likely_questions: [
        "State Newton's three laws of motion and provide a practical real-world example for each.",
        "Show that Newton's First Law is contained as a special case within the Second Law.",
        "Derive the formula for the recoil velocity of a rifle of mass $M$ when a bullet of mass $m$ is fired at velocity $v$.",
        "Draw the Free Body Diagram and calculate the acceleration of two blocks of masses 3kg and 5kg connected by a string over a frictionless pulley (Atwood machine).",
        "Explain static friction, limiting friction, and kinetic friction. Why is static friction called a self-adjusting force?"
      ]
    }
  };
  
  if (data[key]) return data[key];
  
  // Custom fallback
  return {
    topics: [
      {
        title: `Core Foundations of ${topic}`,
        description: `The basic principles, terminologies, and framework elements of ${topic}.`,
        probability: "High",
        priority: "high",
        tip: `Ensure you have memorized the standard definition and diagram of this core element.`
      },
      {
        title: `Practical Application & Calculations`,
        description: `Solving calculations, numerical problems, or analyzing case studies related to ${topic}.`,
        probability: "High",
        priority: "high",
        tip: `Pay careful attention to units, variables, and sign conventions in multi-step solutions.`
      },
      {
        title: `Environmental & Systemic Factors`,
        description: `How changing external conditions affects the efficiency and outcome of ${topic}.`,
        probability: "Medium",
        priority: "med",
        tip: `Identify the three main limiting factors and their respective threshold bounds.`
      },
      {
        title: `Theoretical Models and Research`,
        description: `Competing scientific/academic theories that attempt to explain anomalous behaviors of ${topic}.`,
        probability: "Medium",
        priority: "med",
        tip: `Understand the historical timeline of discoveries and key milestones.`
      },
      {
        title: `Advanced Concepts & Complex Cases`,
        description: `Exceptional cases where standard rules of ${topic} do not apply.`,
        probability: "Low",
        priority: "low",
        tip: `Study the primary exceptions to the rule, as they are commonly tested in advanced questions.`
      }
    ],
    likely_questions: [
      `Define ${topic} and explain its fundamental mechanism step by step.`,
      `What are the major variables that control the rate of ${topic}? Detail their relationship.`,
      `Provide a detailed diagram or flow schematic showing energy transfer during ${topic}.`,
      `Explain the common errors students make when applying calculations for ${topic} and how to avoid them.`,
      `Compare and contrast the primary and secondary models that explain the behavior of ${topic}.`
    ]
  };
}

function getMockResources(topic) {
  const key = getNormalizedTopic(topic);
  const data = {
    photosynthesis: {
      videos: [
        { title: "Photosynthesis: Light Reactions (Z-Scheme)", channel: "CrashCourse Biology", duration: "12 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "The Calvin Cycle Explained Step-by-Step", channel: "Amoeba Sisters", duration: "8 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "Advanced Photosynthesis & Photophosphorylation", channel: "Khan Academy", duration: "22 min", level: "Intermediate", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "Chloroplasts & Light Capture Dynamics", channel: "Professor Dave Explains", duration: "15 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" }
      ],
      ppts: [
        { title: "Photosynthesis Chapter 8 Lecture Slides", source: "SlideShare", slides: "45 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "Quick Revision: Light & Dark Reactions Summary", source: "StudySmarter", slides: "18 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "Limiting Factors & Photosynthetic Efficiency", source: "Author Presentation", slides: "30 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "C3, C4, and CAM Plants Adaptation", source: "University Lectures", slides: "22 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" }
      ],
      notes: [
        { title: "Photosynthesis cheat sheet (equations & cycles)", source: "ExamEdge PDF", pages: "2 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "Class 11 Biology: Photosynthesis in Higher Plants", source: "NCERT Revision", pages: "8 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "The Z-Scheme & Calvin Cycle flow diagrams", source: "Study Notes", pages: "3 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "High-yield Exam Questions on Photosynthesis", source: "Exam Prep Guide", pages: "5 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" }
      ],
      links: [
        { title: "Khan Academy - Photosynthesis Course", url: "khanacademy.org/science/ap-biology/cellular-energetics/photosynthesis", description: "Comprehensive video lessons, practice quizzes, and articles covering AP biology standards.", emoji: "🔗" },
        { title: "Wikipedia - Photosynthesis", url: "en.wikipedia.org/wiki/Photosynthesis", description: "Detailed scientific page on chemical pathways, evolution, and history of discovery.", emoji: "🔗" },
        { title: "Biology LibreTexts - Photosynthesis Chapter", url: "bio.libretexts.org", description: "Open access college level textbook chapter with diagrams and reviews.", emoji: "🔗" },
        { title: "Britannica - Photosynthesis Process", url: "britannica.com/science/photosynthesis", description: "Encyclopedia entry explaining chemical equations and photosynthetic organisms.", emoji: "🔗" }
      ]
    },
    wwii: {
      videos: [
        { title: "World War II: Summary of Major Events", channel: "OverSimplified", duration: "28 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "WWII Eastern Front turning point: Stalingrad", channel: "The Great War", duration: "18 min", level: "Intermediate", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "How WWII Started: European Diplomacy 1930s", channel: "CrashCourse History", duration: "14 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
        { title: "The D-Day landings and beach sectors", channel: "History Channel", duration: "16 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" }
      ],
      ppts: [
        { title: "World War II: Outbreak and Major Battles", source: "SlideShare", slides: "52 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "The Homefront & Economic Mobilization WWII", source: "AP US History Slides", slides: "25 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "Diplomatic Conferences (Yalta, Potsdam) & Post-War", source: "University Presentation", slides: "35 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
        { title: "Quick Revision: WWII Timeline & Treaties", source: "StudySmarter", slides: "20 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" }
      ],
      notes: [
        { title: "WWII Timeline (1939 - 1945) major battles cheat sheet", source: "ExamEdge PDF", pages: "3 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "Causes of WWII: Treaty of Versailles and Fascism notes", source: "IB History Guide", pages: "6 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "Superpowers and the cold war emergence notes", source: "Revision Notes", pages: "4 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
        { title: "High-yield Short Answer Questions on WWII", source: "History Exam Prep", pages: "7 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" }
      ],
      links: [
        { title: "History Channel - World War II History", url: "history.com/topics/world-war-ii", description: "Rich articles, videos, and photo galleries covering the entire duration of the war.", emoji: "🔗" },
        { title: "Imperial War Museums - Second World War", url: "iwm.org.uk/history/second-world-war", description: "Primary sources, personal diaries, and artifacts chronicling war experiences.", emoji: "🔗" },
        { title: "Wikipedia - World War II", url: "en.wikipedia.org/wiki/World_War_II", description: "Comprehensive article tracking military campaigns, politics, and human casualties.", emoji: "🔗" },
        { title: "Britannica - World War II", url: "britannica.com/event/World-War-II", description: "Scholarly overview of major battles, strategic decisions, and consequences.", emoji: "🔗" }
      ]
    }
  };
  
  if (data[key]) return data[key];
  
  // Custom fallback
  return {
    videos: [
      { title: `${topic}: 10-Minute Rapid Crash Course`, channel: "CrashCourse Academy", duration: "10 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
      { title: `${topic} Core Concepts & Masterclass`, channel: "Khan Academy Lectures", duration: "25 min", level: "Intermediate", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
      { title: `Common Exam Questions on ${topic} Explained`, channel: "Professor Explains", duration: "14 min", level: "Beginner", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" },
      { title: `Advanced Analysis: ${topic} Mechanisms`, channel: "University Channel", duration: "18 min", level: "Advanced", emoji: "🎬", color: "#f0f5fd", tag: "Summary Video" }
    ],
    ppts: [
      { title: `${topic} Quick Revision Slides`, source: "SlideShare", slides: "24 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
      { title: `${topic} Chapter 5 Full Lecture Slides`, source: "StudySmarter Slides", slides: "38 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
      { title: `Limiting Factors & Performance variables of ${topic}`, source: "Academic Presenter", slides: "15 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" },
      { title: `Case Studies & Industrial Use of ${topic}`, source: "SlideShare Pro", slides: "20 slides", emoji: "📊", color: "#f7f3fd", tag: "PPT Slides" }
    ],
    notes: [
      { title: `${topic} One-Page Cheat Sheet (Formulas & Laws)`, source: "ExamEdge PDF", pages: "1 page", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
      { title: `${topic} Core Subject Chapter Summary Notes`, source: "Revision Notes Library", pages: "6 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
      { title: `Most Common Mistakes in ${topic} Problems`, source: "Student Guide", pages: "3 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" },
      { title: `${topic} High-Yield Practice Questions Sheet`, source: "Classroom Notes", pages: "4 pages", emoji: "📄", color: "#f0faf4", tag: "Study Notes" }
    ],
    links: [
      { title: `Khan Academy - ${topic} Course`, url: `khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`, description: `Practice exercises and instructional videos covering ${topic}.`, emoji: "🔗" },
      { title: `Wikipedia - ${topic}`, url: `en.wikipedia.org/wiki/${encodeURIComponent(topic)}`, description: `Complete historical overview and technical details of ${topic}.`, emoji: "🔗" },
      { title: `Britannica - Introduction to ${topic}`, url: `britannica.com/search?query=${encodeURIComponent(topic)}`, description: `Scholarly encyclopedia entry detailing the primary functions and definitions.`, emoji: "🔗" },
      { title: `Coursera - Free lectures on ${topic}`, url: `coursera.org/search?query=${encodeURIComponent(topic)}`, description: `University level courses and certificates to learn ${topic} in detail.`, emoji: "🔗" }
    ]
  };
}

function getMockSummary(topic, type) {
  const key = getNormalizedTopic(topic);
  const board = localStorage.getItem('stud_board') || 'CBSE';
  const cls = localStorage.getItem('stud_class') || 'Class 10';
  const data = {
    photosynthesis: {
      brief: `⚡ **60-Second Revision Brief: Photosynthesis**

- **Definition**: The process where photoautotrophs convert light energy into glucose.
- **Location**: Occurs in **chloroplasts**. Light reactions happen in **thylakoid membranes**; dark reactions happen in the **stroma**.
- **Chemical Equation**: **$6CO_2 + 6H_2O \\xrightarrow{\\text{light}} C_6H_{12}O_6 + 6O_2$**
- **Key Facts**:
  1. Water splitting (photolysis) produces oxygen gas.
  2. Chlorophyll absorbs red/blue light best, reflecting green.
  3. ATP and NADPH act as chemical bridges between the light and dark stages.`,
      
      detailed: `## 📖 Detailed Revision Summary: Photosynthesis (Tailored to ${board} ${cls})

Photosynthesis is a biophysical process divided into two main stages: Light-Dependent Reactions and the Light-Independent Calvin Cycle.

### 1. Light-Dependent Reactions (Thylakoids)
- **Absorption of Light**: Chlorophyll pigment clusters (Photosystems I and II) capture photons.
- **Photolysis of Water**: Water is split into protons ($H^+$), electrons ($e^-$), and oxygen gas ($O_2$). The reaction is: **$2H_2O \\rightarrow 4H^+ + 4e^- + O_2$**.
- **Photophosphorylation**: Electron flow drives ATP Synthase to generate **ATP** and reduces NADP+ to **NADPH**.

### 2. Calvin Cycle / Dark Reactions (Stroma)
The Calvin Cycle fixes inorganic carbon dioxide into carbohydrate structures using three distinct phases:
- **Carbon Fixation**: Rubisco enzyme combines $CO_2$ with RuBP to form 3-PGA.
- **Reduction**: ATP and NADPH reduce 3-PGA to G3P (triose phosphate), which eventually forms glucose.
- **Regeneration**: RuBP is regenerated using ATP to keep the cycle running.

### 3. Limiting Factors
- **Light Intensity**: Increases rate until saturation point.
- **CO2 Concentration**: Major limiting factor under normal atmospheric conditions.
- **Temperature**: Enzymes like Rubisco are highly sensitive; too cold slows the rate, too hot denatures enzymes.

💡 **Exam Tip**: Under the **${board}** curriculum guidelines, contrast C3 plants (regular) with C4 plants (sugar cane/maize) which use Kranz anatomy to prevent photorespiration.`,

      outline: `## 🗂 Chapter Outline: Photosynthesis (${board} Syllabus Alignment)

1. **Introduction**
   - 1.1 Definition and Ecological Importance
   - 1.2 Autotrophic Nutrition vs Heterotrophic Nutrition
2. **Site of Photosynthesis**
   - 2.1 Anatomy of a Leaf (Mesophyll cells)
   - 2.2 Ultrastructure of a Chloroplast (Grana, Thylakoid, Stroma)
3. **Light-Dependent Phase**
   - 3.1 Absorption Spectra and Action Spectra of Pigments
   - 3.2 Cyclic vs Non-Cyclic Photophosphorylation (Z-Scheme)
   - 3.3 Photolysis of Water and Chemiosmotic ATP synthesis
4. **Light-Independent Phase (Calvin Cycle)**
   - 4.1 Carboxylation (Rubisco role)
   - 4.2 Reduction (Triose phosphate creation)
   - 4.3 Regeneration of RuBP (Ribulose 1,5-bisphosphate)
5. **Alternative Carbon Fixation Pathways**
   - 5.1 C4 Pathway (Hatch-Slack Cycle) and Kranz Anatomy
   - 5.2 CAM (Crassulacean Acid Metabolism) in desert plants
6. **Limiting Factors**
   - 6.1 Light, CO2, Water, Temperature curves`,

      mindmap: `[PHOTOSYNTHESIS PROCESS]
  → Site
    • Mesophyll cells of leaves
    • Chloroplast organelle
  → Light-Dependent Reactions
    • Location: Thylakoid membranes
    • Inputs: H2O, Light, NADP+, ADP
    • Outputs: O2 (waste), NADPH, ATP
    • Pathway: Z-scheme electron flow
  → Calvin Cycle (Dark Reactions)
    • Location: Chloroplast stroma
    • Inputs: CO2, NADPH, ATP
    • Outputs: Glucose (C6H12O6), NADP+, ADP
    • Stages: Fixation, Reduction, Regeneration
  → Limiting Factors
    • Carbon Dioxide concentration (most common limit)
    • Light Intensity (saturation point)
    • Temperature (denatures Rubisco enzyme)`,

      compare: `## ⚖ Compare & Contrast: Light vs Dark Reactions

| Feature | Light-Dependent Reactions | Light-Independent (Calvin Cycle) |
|---|---|---|
| **Location** | Thylakoid membranes (Grana) | Chloroplast Stroma |
| **Light Dependency** | Directly dependent on solar photons | Indirectly dependent (requires ATP/NADPH products) |
| **Inputs** | $H_2O$, Light, $ADP$, $NADP^+$ | $CO_2$, $ATP$, $NADPH$ |
| **Outputs** | $O_2$ gas, $ATP$, $NADPH$ | Glucose, $ADP$, $NADP^+$ |
| **Primary Process** | Splitting water and energy capture | Fixing carbon dioxide into sugar |
| **Key Enzymes** | Photosystem II & I complex, ATP Synthase | Rubisco (Ribulose bisphosphate carboxylase) |`
    },
    wwii: {
      brief: `⚡ **60-Second Revision Brief: World War II**

- **Timeframe**: September 1, 1939 - September 2, 1945.
- **Belligerents**: **Allies** (UK, US, USSR, France, China) vs. **Axis** (Germany, Japan, Italy).
- **Core Causes**: Treaty of Versailles failures, rise of militaristic fascism, policy of appeasement.
- **Key Turning Points**:
  1. Battle of Stalingrad (Eastern Front, Germany retreats).
  2. Pearl Harbor attack (Brings US into war).
  3. D-Day (Allies open Western Front).
- **Outcome**: Axis defeat. Germany divided; USA and USSR emerge as Cold War rivals. United Nations established.`,
      
      detailed: `## 📖 Detailed Revision Summary: World War II (1939 - 1945)

World War II was the largest and most destructive conflict in human history, involving over 30 countries and resulting in an estimated 70-85 million casualties.

### 1. Causes of the War
- **Failed Peace**: The **Treaty of Versailles (1919)** crippled Germany's economy and stability, fostering extreme nationalism.
- **Fascist Aggression**: Adolf Hitler (Germany) and Benito Mussolini (Italy) pursued aggressive expansion. Japan invaded Manchuria and China.
- **Appeasement**: Western democracies ignored early breaches of international law. The Munich Agreement (1938) surrendered Czechoslovakia's Sudetenland.

### 2. Main Theatres and Key Turning Points
- **Invasion of Poland (1939)**: Blitzkrieg tactics overwhelm Poland, starting the war.
- **Battle of Britain (1940)**: Royal Air Force successfully defends UK against German Luftwaffe air raids.
- **Operation Barbarossa (1941)**: Hitler breaks pact and invades USSR.
- **Pearl Harbor (Dec 7, 1941)**: Japan bombs US fleet, causing US entry.
- **Battle of Stalingrad (1942-1943)**: German 6th Army surrenders, shifting momentum to the Soviet Union.
- **D-Day (June 6, 1944)**: Allied landing in Normandy opens Western Europe.
- **Atomic Bombings (August 1945)**: Dropping of atomic bombs on Hiroshima and Nagasaki forces Japanese surrender.

### 3. Impact & Post-War Settlements
- **Cold War Roots**: The Yalta and Potsdam conferences divided Germany and Europe, setting up tensions between the democratic West and communist East.
- **Decolonization**: Weakened European empires can no longer maintain colonies.
- **Creation of the UN**: Established in San Francisco (1945) to maintain peace.`,

      outline: `## 🗂 Chapter Outline: World War II

1. **Origins of the War**
   - 1.1 Ideological factors: Nazism, Fascism, Japanese militarism
   - 1.2 Structural weaknesses of the League of Nations
   - 1.3 The road to war: Anschluss, Munich Pact, Nazi-Soviet Pact
2. **Early Axis Expansion (1939 - 1941)**
   - 2.1 Invasion of Poland and Blitzkrieg tactics
   - 2.2 Fall of France and the Battle of Britain
   - 2.3 Battle of the Atlantic and naval blockades
3. **The Global Conflict (1941 - 1943)**
   - 3.1 Invasion of Russia (Operation Barbarossa)
   - 3.2 Pacific War and USA mobilization
   - 3.3 The turning points: Battle of Midway, El Alamein, Stalingrad
4. **Allied Victory (1943 - 1945)**
   - 4.1 Downfall of Fascist Italy
   - 4.2 Normandy Landings (D-Day) and race to Berlin
   - 4.3 Atomic warfare and surrender of Japan
5. **Humanitarian and Geopolitical Aftermath**
   - 5.1 The Holocaust and Nuremberg Trials
   - 5.2 Decolonization movements in Asia and Africa
   - 5.3 Division of Germany and rise of the Bipolar Cold War Era`,

      mindmap: `[WORLD WAR II (1939-1945)]
  → Causes
    • Hardships of Treaty of Versailles
    • Rise of Fascism in Germany & Italy
    • Failures of League of Nations & Appeasement
    • Direct trigger: Invasion of Poland
  → Alliances
    • Allied Powers: UK, USSR, USA, France, China
    • Axis Powers: Germany, Japan, Italy
  → European Theater
    • Turning point: Battle of Stalingrad
    • Western Front: Normandy D-Day Landings
    • Defeat of Germany: May 1945 (V-E Day)
  → Pacific Theater
    • Turning point: Battle of Midway
    • Atomic Bombings: Hiroshima & Nagasaki
    • Defeat of Japan: Sept 1945 (V-J Day)
  → Post-War Consequences
    • Formation of United Nations (1945)
    • Cold War begins (US vs USSR superpower rivalry)
    • Division of Germany into West and East`,

      compare: `## ⚖ Compare & Contrast: WWI vs WWII

| Feature | World War I (1914 - 1918) | World War II (1939 - 1945) |
|---|---|---|
| **Alliances** | Allied Powers (UK, France, Russia, US) vs Central Powers (Germany, Austria-Hungary, Ottoman Empire) | Allied Powers (UK, US, USSR, China) vs Axis Powers (Germany, Japan, Italy) |
| **Combat Tactics** | Trench warfare, heavy artillery stalemate | Highly mobile blitzkrieg, armored division columns, aircraft carriers, air bombings |
| **Ideological Drivers** | Imperial expansions, militarism, national alliances | Fascism, extreme nationalism, Communism vs Democracy |
| **Key Weapons** | Mustard gas, early tanks, machine guns, submarines | Atomic bomb, radar, rocket missiles, advanced fighter planes |
| **Peace Settlements** | Treaty of Versailles (severe reparation demands) | Division of Germany into occupation zones, trial of war crimes, creation of UN |`
    }
  };
  
  if (data[key] && data[key][type]) return data[key][type];
  
  // Custom fallback
  const fallbacks = {
    brief: `⚡ **60-Second Revision Brief: ${topic}**
    
- **Core Concept**: Fundamental framework relating to how variables interact.
- **Key Equations/Laws**: Governed by the conservation laws and rates of transfer.
- **Key Pillars**:
  1. Direct inputs drive system energy.
  2. Variables determine internal rates.
  3. Final output matches the conservation efficiency.
- **Common Exam Trick**: Keep track of the units! Verify whether values are in SI before solving.`,
    
    detailed: `## 📖 Detailed Revision Summary: ${topic} (Board Syllabus)

### 1. Fundamental Definition
**${topic}** is a major scientific/academic framework that explores how energy, material, or information is transferred across states.

### 2. Core Operational Stages
- **Stage 1 (System Input)**: The initialization where raw vectors enter the system boundaries.
- **Stage 2 (Reaction/Calculation)**: The core phase where changes, formulas, or forces modify the inputs.
- **Stage 3 (System Output)**: The final stable state where outputs are released or solved.

### 3. Key Variables to Watch
- **Catalysts**: Accelerate rates without being consumed.
- **Temperature & Pressure**: Dictate thermodynamic limits.
- **Concentration**: Affects frequency of element collisions.

💡 **Exam Tip**: In **${board}** descriptive questions, always begin with the formal definition, write down the governing formula, and draw a block diagram representing the input-output cycle.`,
    
    outline: `## 🗂 Chapter Outline: ${topic} (Tailored for ${board} ${cls})

1. **Introduction & Definition of ${topic}**
   - 1.1 Historical Context and Key Theorists
   - 1.2 Standard Nomenclature and Definitions
2. **Foundational Principles**
   - 2.1 The Governing Equations and Variables
   - 2.2 Free Body/System Boundary Diagrams
3. **Operational Mechanics**
   - 3.1 Stage-by-stage transfer of energy/information
   - 3.2 Factors influencing reaction rates and efficiency
4. **Calculations and Problem Solving**
   - 4.1 Common numerical formats in examinations
   - 4.2 Avoidance of common sign errors
5. **Practical & Industrial Applications**
   - 5.1 Case studies of modern systems
   - 5.2 Environmental impacts and efficiency optimizations`,

    mindmap: `[${topic.toUpperCase()}]
  → Core Definitions
    • Basic concept and governing rules
    • Primary variables (Input, State, Output)
  → Operational Stages
    • Stage 1: Activation / Input energy
    • Stage 2: Interaction / Mathematical processing
    • Stage 3: Stabilization / Output yields
  → Limiting Factors
    • System temperature boundaries
    • Media resistance and pressure
    • Availability of activation catalysts
  → ${board} Exam Checklist
    • Practice dimensional analysis of equations
    • Draw flowcharts representing states
    • Review primary exceptions to the rules`,

    compare: `## ⚖ Compare & Contrast: ${topic} vs Related Systems

| Feature | Primary ${topic} Model | Secondary Model |
|---|---|---|
| **Core Concept** | Standard state framework | Dynamic alternative state |
| **Governing Rules** | Conservative equations | Empirical approximations |
| **Inputs** | Direct system vectors | Random environmental noise |
| **Sensitivity** | High sensitivity to initial state | Low sensitivity, high buffer |
| **Common Use** | Standard classroom calculations | Advanced industrial cases |`
  };
  
  return fallbacks[type] || fallbacks.brief;
}

function getMockFlashcards(topic) {
  const key = getNormalizedTopic(topic);
  const board = localStorage.getItem('stud_board') || 'CBSE';
  const data = {
    photosynthesis: {
      cards: [
        { front: "What is the primary site of photosynthesis in plants?", back: "The chloroplast (mesophyll cells of leaves)." },
        { front: "Write the balanced chemical equation for photosynthesis.", back: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2" },
        { front: "Which photosystem absorbs light at 680 nm wavelength?", back: "Photosystem II (PS II)." },
        { front: "What is the function of the Rubisco enzyme?", back: "It catalyzes carbon dioxide fixation in the Calvin Cycle." },
        { front: "Name the products of the light-dependent reactions.", back: "ATP, NADPH, and Oxygen gas (O2)." },
        { front: "What happens during photolysis of water?", back: "Water is split into oxygen, protons (H+), and electrons in PS II." },
        { front: "Which reactions of photosynthesis take place in the stroma?", back: "The light-independent reactions (Calvin Cycle)." },
        { front: "What is the main pigment that captures light?", back: "Chlorophyll a." },
        { front: "Name two limiting factors of photosynthesis.", back: "Light intensity, carbon dioxide concentration, and temperature." },
        { front: "How do C4 plants reduce photorespiration?", back: "By separating carbon fixation and the Calvin cycle in different cells (spatial separation)." }
      ]
    },
    wwii: {
      cards: [
        { front: "Which invasion officially started World War II?", back: "Germany's invasion of Poland on September 1, 1939." },
        { front: "Name the three major Axis Powers.", back: "Germany, Italy, and Japan." },
        { front: "When did the Pearl Harbor bombing occur?", back: "December 7, 1941." },
        { front: "What battle was the major turning point on the Eastern Front?", back: "The Battle of Stalingrad (1942-1943)." },
        { front: "What date is known as D-Day?", back: "June 6, 1944 (Allied invasion of Normandy)." },
        { front: "Which cities did the US drop atomic bombs on?", back: "Hiroshima (August 6, 1945) and Nagasaki (August 9, 1945)." },
        { front: "Who was the Prime Minister of the UK during most of WWII?", back: "Winston Churchill." },
        { front: "What treaty's failure paved the way for WWII?", back: "The Treaty of Versailles (1919)." },
        { front: "What organization was created post-war to replace the League of Nations?", back: "The United Nations (UN)." },
        { front: "On what date did WWII officially end?", back: "September 2, 1945 (Instrument of Surrender signed by Japan)." }
      ]
    },
    quadratic: {
      cards: [
        { front: "What is the standard form of a quadratic equation?", back: "ax^2 + bx + c = 0, where a ≠ 0." },
        { front: "Write down the quadratic formula.", back: "x = (-b ± √(b^2 - 4ac)) / 2a" },
        { front: "What is the discriminant formula?", back: "Δ = b^2 - 4ac" },
        { front: "If discriminant is zero (Δ = 0), what are the roots?", back: "Real and equal roots (one repeated root)." },
        { front: "If discriminant is negative (Δ < 0), what are the roots?", back: "No real roots; two complex (imaginary) roots." },
        { front: "What is the sum of roots in ax^2 + bx + c = 0?", back: "Sum = -b/a." },
        { front: "What is the product of roots in ax^2 + bx + c = 0?", back: "Product = c/a." },
        { front: "How do you find the vertex of the parabola y = ax^2 + bx + c?", back: "x-coordinate = -b/2a." },
        { front: "When does a quadratic parabola open downwards?", back: "When the leading coefficient 'a' is negative (a < 0)." },
        { front: "What is completing the square?", back: "A method to solve quadratics by creating a perfect square trinomial on one side." }
      ]
    },
    newton: {
      cards: [
        { front: "State Newton's First Law of Motion.", back: "An object remains in rest or constant motion unless acted on by a external net force (Inertia)." },
        { front: "Write down the formula for Newton's Second Law.", back: "F = ma (Force = Mass × Acceleration)." },
        { front: "State Newton's Third Law of Motion.", back: "For every action, there is an equal and opposite reaction." },
        { front: "What is inertia?", back: "The inherent property of matter to resist any change in its state of rest or motion." },
        { front: "What is limiting friction?", back: "The maximum static frictional force acting between two surfaces before sliding starts." },
        { front: "Write down the law of conservation of momentum.", back: "Total linear momentum of an isolated system remains constant before and after collision." },
        { front: "Why do passengers jerk forward when a bus brakes?", back: "Due to inertia of motion (the body wants to keep moving forward)." },
        { front: "What is the unit of force in the SI system?", back: "The Newton (N) = 1 kg·m/s^2." },
        { front: "Do action and reaction cancel each other?", back: "No, because they act on different bodies." },
        { front: "What force keeps an object moving in a circle?", back: "Centripetal force (directed towards the center)." }
      ]
    }
  };
  
  if (data[key]) return data[key];
  
  // Custom fallback
  return {
    cards: [
      { front: `What is the core definition of ${topic}?`, back: `The primary system that regulates and structures interactions in this area.` },
      { front: `What is the primary formula or law governing ${topic}?`, back: `It is governed by the state transformation and rate equations of the system.` },
      { front: `Name the three main variables involved in ${topic}.`, back: `Input velocity, system state resistance, and catalyst efficiency.` },
      { front: `What happens when the temperature exceeds the limits of ${topic}?`, back: `The system enzymes denature or the structures undergo phase destabilization.` },
      { front: `Explain the distinction between inputs and outputs in ${topic}.`, back: `Inputs represent raw vectors; outputs represent stable products after modification.` },
      { front: `Why is drawing a flowchart helpful in ${board} exams?`, back: `It visually demonstrates the sequence of actions and connections between states.` },
      { front: `What is the most common student error in ${topic} calculations?`, back: `Forgetting to convert variables to standard SI units before applying formulas.` },
      { front: `How does a catalyst affect the reaction rate of ${topic}?`, back: `It lowers the activation barrier, increasing the velocity without being consumed.` },
      { front: `Mention a major real-life application of ${topic}.`, back: `It is widely utilized in industrial manufacturing, thermodynamics, and software models.` },
      { front: `State one exam trick for remembering the core components of ${topic}.`, back: `Use the acronym 'I-S-O' to recall Input, State modification, and Output.` }
    ]
  };
}

// ─── EVENT LISTENERS ───
document.getElementById('doubtQ').addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) solveDoubt(); });
document.getElementById('globalTopic').addEventListener('keydown', e => { if (e.key === 'Enter') setGlobalTopic(); });

// ─── FOOTER REVIEW & RATING HANDLERS ───
function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.star-rating .star');
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function submitReview(e) {
  e.preventDefault();
  const phoneInput = document.getElementById('revPhone');
  const emailInput = document.getElementById('revEmail');
  const feedbackInput = document.getElementById('revFeedback');
  
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const feedback = feedbackInput ? feedbackInput.value.trim() : '';
  
  if (currentRating === 0) {
    showToast('Please rate your experience first!');
    return;
  }
  
  // Store review data locally
  localStorage.setItem('review_submitted', 'true');
  localStorage.setItem('review_phone', phone);
  localStorage.setItem('review_email', email);
  localStorage.setItem('review_rating', currentRating);
  localStorage.setItem('review_feedback', feedback);
  
  // Update UI
  const rForm = document.getElementById('reviewForm');
  const rSuccess = document.getElementById('reviewSuccess');
  if (rForm) rForm.style.display = 'none';
  if (rSuccess) rSuccess.style.display = 'block';
  
  const bubbleText = document.querySelector('.mascot-bubble .bubble-text');
  if (bubbleText) {
    bubbleText.textContent = "Thank you so much! You are going to CRUSH the exam! 🏆";
  }
  
  showToast('Review submitted! Thank you!');
}
