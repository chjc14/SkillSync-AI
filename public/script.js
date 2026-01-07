// --- SkillSync AI: Fortified Master Script (Groq Primary + Final Auth Fix) ---

// 1. PDF.js Safe Initialization
const pdfjsLib = window['pdfjsLib']; 
if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// 2. API Configuration (STRICT ORDER: GROQ FIRST)
let keyIndex = 0; 


if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); 

let currentUser = null; 
let extractedResumeText = ""; 

// --- 4. Auth State Observer (Fixed Page Redirects) ---
auth.onAuthStateChanged(async (user) => {
    const loader = document.getElementById('page-loader');
    const content = document.getElementById('app-content');
    const isLoginPage = !!document.getElementById('login-form');

    if (user) {
        currentUser = user;
        if (isLoginPage) {
            window.location.href = 'dashboard.html'; // Redirect to dashboard if logged in
        } else {
            if (loader) loader.classList.add('hidden');
            if (content) {
                content.classList.remove('hidden');
                setTimeout(() => content.classList.add('opacity-100'), 50);
            }
            loadHistory(); 
        }
    } else {
        // If not logged in and not on login page, redirect back
        if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('analyze')) {
            window.location.href = 'index.html';
        }
    }
});

// --- 5. FIXED SIGNUP & LOGIN LOGIC ---
// This section is now highly defensive to prevent silent crashes
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const name = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;

    if (btn) { btn.disabled = true; btn.innerText = "Creating..."; }

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        // Create the user profile in Firestore
        await db.collection("users").doc(cred.user.uid).set({
            displayName: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        window.location.href = 'dashboard.html';
    } catch (err) {
        alert("Signup Error: " + err.message);
        if (btn) { btn.disabled = false; btn.innerText = "Create Account"; }
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
        alert("Login Error: " + err.message);
    }
});

// Toggle Buttons Logic
document.getElementById('toggle-signup')?.addEventListener('click', () => {
    document.getElementById('login-form')?.classList.add('hidden');
    document.getElementById('signup-form')?.classList.remove('hidden');
    document.getElementById('toggle-signup')?.classList.add('bg-blue-600', 'text-white');
    document.getElementById('toggle-login')?.classList.remove('bg-blue-600', 'text-white');
});

document.getElementById('toggle-login')?.addEventListener('click', () => {
    document.getElementById('signup-form')?.classList.add('hidden');
    document.getElementById('login-form')?.classList.remove('hidden');
    document.getElementById('toggle-login')?.classList.add('bg-blue-600', 'text-white');
    document.getElementById('toggle-signup')?.classList.remove('bg-blue-600', 'text-white');
});

// --- 6. PDF Extraction Engine ---
async function processFile(file) {
    if (!file) return;
    const statusEl = document.getElementById('file-status');
    const btn = document.getElementById('btn-run-analysis');
    if (statusEl) { statusEl.innerText = "⏳ Reading Resume..."; statusEl.classList.remove('hidden'); }
    const reader = new FileReader();
    reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                fullText += text.items.map(item => item.str).join(" ") + "\n";
            }
            extractedResumeText = fullText;
            if (statusEl) statusEl.innerText = `📄 ${file.name} READY! ✅`;
            if (btn) { btn.disabled = false; btn.classList.remove('opacity-30'); }
        } catch (e) { if (statusEl) statusEl.innerText = "❌ Error reading PDF"; }
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById('file-input')?.addEventListener('change', (e) => processFile(e.target.files[0]));
window.handleDrop = (e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); };

// --- 7. Resilient AI Engine (Groq First) ---
document.getElementById('btn-run-analysis')?.addEventListener('click', () => {
    const jd = document.getElementById('job-desc')?.value.trim();
    if (!jd) return alert("Paste Job Description first!");
    if (!extractedResumeText) return alert("Upload Resume first!");
    document.getElementById('results')?.classList.remove('hidden');
    callAI(jd, extractedResumeText);
});


// --- Verified AI Engine: Fixes 404 Error ---

// --- SkillSync AI: Final Visual Architect Script ---

// --- SkillSync AI: Technical Mentor & Project Strategist ---
// --- SkillSync AI: Encouraging Architect & Project Strategist ---

async function callAI(jd, resume) {
    const aiOutput = document.getElementById('ai-text');
    const skillGapContainer = document.getElementById('skill-gap');
    const roadmapContainer = document.getElementById('roadmap-list');
    
    if (aiOutput) aiOutput.innerText = "🤖 Analyzing with an encouraging lens...";

    // UPDATED PROMPT: Softened scoring and focus on potential
    const prompt = `Act as an encouraging Technical Mentor and Senior Architect. 
    Analyze this Resume against the JD to create a growth-oriented roadmap.

    SCORING & LOGIC RULES:
    1. POSITIVE BIAS: Be realistic but NOT harsh. If a user has foundational skills (e.g., knows Java but not Spring), give significant partial credit.
    2. ENCOURAGING SCORE: A 60% literal match should result in a 75-80% "Potential Match" score.
    3. RANK GAPS: Rank missing skills as HIGH/MEDIUM/LOW.
    4. PROJECT AUDIT: Tier current projects (Beg/Int/Adv) and suggest one "Level-Up" feature to make them professional.
    5. TARGETED PROJECTS: Suggest 2 'Learning-by-Doing' projects using the JD's tech stack.
    6. EXECUTION: For projects, list 'What to Learn' and a 'Step-by-Step' build strategy.

    Respond ONLY in valid JSON:
    {
      "score": number,
      "analysis": "Encouraging summary of technical standing and fit.",
      "ranked_gaps": [{"skill": "Name", "priority": "HIGH/MEDIUM/LOW"}],
      "project_audit": [{"name": "Name", "tier": "Beg/Int/Adv", "fix": "Tip"}],
      "growth_path": [
        {
          "project_title": "Title",
          "stack": ["T1", "T2"],
          "what_to_learn": ["Concept A"],
          "how_to_build": "Detailed execution strategy."
        }
      ],
      "roadmap": [{"step": "Action", "desc": "Strategy"}]
    }
    JD: ${jd}
    Resume: ${resume}`;

    let currentProvider = apiKeys[keyIndex]; 
    let url, headers, body;

    if (currentProvider.type === 'groq') {
        url = `https://api.groq.com/openai/v1/chat/completions`;
        headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentProvider.key}` };
        body = JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 4096 });
    } else {
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentProvider.key}`;
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 4096 } });
    }

    try {
        const response = await fetch(url, { method: 'POST', headers, body });
        const data = await response.json();
        let rawText = currentProvider.type === 'groq' ? data.choices[0].message.content : data.candidates[0].content.parts[0].text;
        const result = JSON.parse(rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1).trim());

        // --- VISUAL RENDERING (STAYS THE SAME) ---
        document.getElementById('meter-progress').style.strokeDashoffset = 251.2 - (result.score / 100) * 251.2;
        document.getElementById('meter-text').innerText = `${result.score}%`;
        if (aiOutput) aiOutput.innerHTML = `<div class="p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-slate-300 text-sm">${result.analysis}</div>`;
        
        if (skillGapContainer) {
            skillGapContainer.innerHTML = result.ranked_gaps.map(g => `
                <div class="bg-slate-800 p-2 rounded-xl border border-slate-700 text-center min-w-[100px]">
                    <span class="text-[9px] font-bold uppercase ${g.priority === 'HIGH' ? 'text-red-400' : 'text-blue-400'}">${g.priority}</span>
                    <span class="text-white text-xs font-mono font-bold">${g.skill}</span>
                </div>`).join('');
        }

        if (roadmapContainer) {
            let visualHTML = "";
            visualHTML += `<h3 class="text-blue-400 font-bold text-xs uppercase mb-3 mt-4 tracking-widest">Project Depth Audit</h3>`;
            visualHTML += result.project_audit.map(p => `
                <div class="bg-slate-900/80 p-4 rounded-2xl border-l-4 border-amber-500 mb-4 shadow-lg">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-white font-bold text-sm">${p.name}</span>
                        <span class="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">${p.tier}</span>
                    </div>
                    <p class="text-slate-400 text-xs">${p.fix}</p>
                </div>`).join('');

            visualHTML += `<h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 mt-6 tracking-widest">Growth Project Suggestions</h3>`;
            visualHTML += result.growth_path.map(gp => `
                <div class="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/30 mb-4 shadow-xl">
                    <h4 class="text-emerald-400 font-bold text-base mb-2">${gp.project_title}</h4>
                    <div class="mb-3">
                        <p class="text-white text-[10px] font-bold uppercase mb-1">📚 What to Learn:</p>
                        <div class="flex flex-wrap gap-1">${gp.what_to_learn.map(l => `<span class="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded border border-slate-700">${l}</span>`).join('')}</div>
                    </div>
                    <div>
                        <p class="text-white text-[10px] font-bold uppercase mb-1">🛠️ Execution Strategy:</p>
                        <p class="text-slate-400 text-xs leading-relaxed">${gp.how_to_build}</p>
                    </div>
                </div>`).join('');

            roadmapContainer.innerHTML = visualHTML;
        }
        
        await db.collection("users").doc(currentUser.uid).collection("resumes").add({
            score: result.score, analysis: result.analysis, timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadHistory();
    } catch (e) {
        if (keyIndex < apiKeys.length - 1) { keyIndex++; return callAI(jd, resume); }
        if (aiOutput) aiOutput.innerText = "❌ Analysis Sync Failed.";
    }
}

// --- 8. History & Logout ---
async function loadHistory() {
    const list = document.getElementById('history-list');
    if (!list || !currentUser) return;
    try {
        const snap = await db.collection("users").doc(currentUser.uid).collection("resumes").orderBy("timestamp", "desc").limit(5).get();
        list.innerHTML = snap.empty ? `<p class="text-slate-500 text-xs italic text-center">No scans yet.</p>` : "";
        snap.forEach(doc => {
            const d = doc.data();
            const item = document.createElement('div');
            item.className = "p-3 bg-slate-900/50 rounded-xl border border-slate-700 text-xs mb-2 font-bold text-blue-400";
            item.innerHTML = `Match: ${d.score}%`;
            list.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

document.getElementById('btn-logout')?.addEventListener('click', () => auth.signOut());