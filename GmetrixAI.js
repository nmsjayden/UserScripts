// ==UserScript==
// @name         GMetrix Auto AI Solver v7.3 Full Fix
// @namespace    http://tampermonkey.net/
// @version      7.3
// @description  Fully automatic GMetrix AI solver with retry counter, reset support, multiple-choice, DTC, dropdown, drag/drop, verbose logs.
// @match        https://www.gmetrix.net/Courses/Course.aspx*
// @match        https://www.gmetrix.net/Tests/RunUnityTest.aspx*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const OPENROUTER_KEY = "OPENROUTER KEY HERE -> https://openrouter.ai/settings/keys";
    const OPENROUTER_MODEL = "openrouter/free";
    const MAX_RETRIES = 3;
    const THINK_DELAY = 300;
    const FETCH_TIMEOUT = 15000;
    const NEXT_PAGE_DELAY = 1000;

    let autoSolveEnabled = false;
    const retryCounters = {}; // Track retries per question

    const log = (...args) => console.log('%c[GMetrixSolver]', 'color:#FF4500;font-weight:bold;', ...args);
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const safeParseJSON = aiResponse => {
        try {
            if(!aiResponse) return { answers: [], mapping: {}, multi: false, raw: "" };
            let clean = aiResponse.replace(/```(json)?/gi,'').trim();
            const match = clean.match(/\{[\s\S]*\}/m);
            if(match){
                const parsed = JSON.parse(match[0]);
                log('✅ Parsed AI JSON:', parsed);
                return {
                    answers: parsed.answers || [],
                    mapping: parsed.mapping || {},
                    multi: parsed.multi || false,
                    raw: parsed.raw
                };
            }
        } catch(e){ log('⚠️ JSON parse error', e); }
        return { answers: [], mapping: {}, multi: false, raw: aiResponse };
    };

    const fetchWithTimeout = (url, opts, timeout=FETCH_TIMEOUT) =>
        Promise.race([fetch(url,opts), new Promise((_,rej)=>setTimeout(()=>rej(new Error('AI request timed out')),timeout))]);

    const sendAI = async (prompt, retries=0) => {
        const body = { model: OPENROUTER_MODEL, messages:[{role:"user", content:prompt}], max_tokens:1024, temperature:0.2 };
        try{
            log('⏳ Sending prompt to AI (retry', retries, '):\n', prompt);
            await sleep(THINK_DELAY);
            const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
                method:"POST",
                headers: { "Content-Type":"application/json", "Authorization": `Bearer ${OPENROUTER_KEY}` },
                body: JSON.stringify(body)
            });
            if(!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
            const textOut = (await res.json())?.choices?.[0]?.message?.content || "";
            log('📤 AI Response:', textOut);
            return textOut;
        } catch(err){
            log('⚠️ AI request failed:', err);
            if(retries<MAX_RETRIES) return sendAI(prompt,retries+1);
            return { error: err.message || "" };
        }
    };

    const detectQuestionType = doc => {
        if(doc.querySelector('button.multipleChoiceButton')) return 'MULTIPLE_CHOICE';
        if(doc.querySelector('select.dropDown')) return 'DROPDOWN';
        if(doc.querySelector('.option') && doc.querySelector('.column h4')) return 'DTC_CATEGORY';
        if(doc.querySelector('.optionDiv') && doc.querySelector('.targetContainer')) return 'MATCH_DRAG';
        if(doc.querySelector('canvas') || doc.querySelector('.unity-content')) return 'SIMULATION';
        return 'UNKNOWN';
    };

    const safeDDLChange = sel => { if(typeof window.DDLControlChange==="function") try{ window.DDLControlChange(sel) }catch(e){ log(e) } };
    const simulateClick = el => ['mousedown','mouseup','click'].forEach(e=>el.dispatchEvent(new MouseEvent(e,{bubbles:true,cancelable:true})));
    const normalizeText = str => str.replace(/\s+/g,'').replace(/[\u200B-\u200D\uFEFF]/g,'').toLowerCase();

    const getButtonText = btn => {
        const clone = btn.cloneNode(true);
        clone.querySelectorAll('span,i').forEach(n=>n.remove());
        return clone.innerText.trim().replace(/\s+/g,' ');
    };

    const getQuestionID = doc => doc.querySelector('#contentMain_QuestionScreenReaderInfo')?.innerText?.match(/ID (\d+)/)?.[1] || 'unknown';

    const resetQuestion = async () => {
        const resetBtn = document.querySelector('#contentMain_resetButton');
        if(resetBtn){ simulateClick(resetBtn); log('🔄 Question reset'); await sleep(500); }
    };

    async function solveMultipleChoice(doc, questionID){
        retryCounters[questionID] = retryCounters[questionID] || 0;
        const buttons = [...doc.querySelectorAll('button.multipleChoiceButton')];
        if(!buttons.length){ log('⚠️ No multiple choice buttons found'); return; }

        const options = buttons.map(b=>getButtonText(b));
        const question = doc.querySelector('#InstructionText')?.innerText.trim() || 'No question text';
        let maxSelections = 1;
        const matchNum = question.match(/\(Choose\s+(\d+)\)/i);
        const matchWord = question.match(/\(Choose\s+(one|two|three|four|five|six)\)/i);
        if(matchNum) maxSelections=parseInt(matchNum[1],10);
        else if(matchWord) maxSelections={one:1,two:2,three:3,four:4,five:5,six:6}[matchWord[1].toLowerCase()]||1;

        const prompt = `
You are a precise GMetrix quiz solver. Retry count: ${retryCounters[questionID]}.
Return ONLY JSON: { "answers": ["Option Text"] } up to ${maxSelections} selections.
Question: ${question}
Options:
${options.map(a=>`- ${a}`).join('\n')}
No explanations.`;

        const parsed = safeParseJSON(await sendAI(prompt, retryCounters[questionID]));
        if(!parsed.answers.length){
            retryCounters[questionID]++;
            if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for this question');
            await resetQuestion();
            log('⚠️ AI returned no answers, retrying multiple choice');
            return solveMultipleChoice(doc, questionID);
        }

        for(const answerText of parsed.answers.slice(0,maxSelections)){
            const btn = buttons.find(b=>normalizeText(getButtonText(b)) === normalizeText(answerText));
            if(btn){ simulateClick(btn); await sleep(150); }
            else {
                retryCounters[questionID]++;
                if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for this question');
                await resetQuestion();
                log(`⚠️ Button not found for "${answerText}", retrying`);
                return solveMultipleChoice(doc, questionID);
            }
        }
        log('✅ Multiple choice completed');
    }

    async function solveDropdown(doc, questionID){
        retryCounters[questionID] = retryCounters[questionID] || 0;
        for(const sel of [...doc.querySelectorAll('select.dropDown')]){
            const options = [...sel.options].map(o=>o.textContent.trim());
            const questionText = sel.getAttribute('aria-describedby') ? (doc.getElementById(sel.getAttribute('aria-describedby'))?.innerText || '') : '';
            const prompt = `
Retry count: ${retryCounters[questionID]}.
Return ONLY JSON: { "answers": ["Option Text"] }.
Question: ${questionText}
Options:
${options.map(o=>`- ${o}`).join('\n')}
No explanations.`;
            const parsed = safeParseJSON(await sendAI(prompt, retryCounters[questionID]));
            const answerText = parsed.answers[0];
            if(!answerText){
                retryCounters[questionID]++;
                if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for this dropdown');
                await resetQuestion();
                log('⚠️ Dropdown AI returned no answer, retrying');
                return solveDropdown(doc, questionID);
            }
            const option = [...sel.options].find(o=>normalizeText(o.textContent) === normalizeText(answerText));
            if(option){ sel.value=option.value; sel.dispatchEvent(new Event('change',{bubbles:true})); safeDDLChange(sel); await sleep(150); }
            else {
                retryCounters[questionID]++;
                if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for this dropdown');
                await resetQuestion();
                log(`⚠️ Dropdown option not found for "${answerText}", retrying`);
                return solveDropdown(doc, questionID);
            }
        }
        log('✅ Dropdowns completed');
    }

    async function solveDTC(doc, questionID){
        retryCounters[questionID] = retryCounters[questionID] || 0;
        const statements = [...doc.querySelectorAll('.option')].map(o=>o.querySelector('.optionChild')?.innerText.trim()||'');
        const categories = [...doc.querySelectorAll('.column h4')].map(h=>h.innerText.trim());
        const question = doc.querySelector('#InstructionText')?.innerText.trim()||'';
        if(!statements.length||!categories.length){ log('⚠️ DTC missing elements'); return; }

        const prompt = `
Retry count: ${retryCounters[questionID]}.
Return ONLY JSON: { "mapping": { "Statement Text": "Category Text" } }.
Question: ${question}
Statements:
${statements.map(s=>`- ${s}`).join('\n')}
Categories:
${categories.map(c=>`- ${c}`).join('\n')}
No explanations.`;

        const parsed = safeParseJSON(await sendAI(prompt, retryCounters[questionID]));
        if(!parsed.mapping||Object.keys(parsed.mapping).length===0){
            retryCounters[questionID]++;
            if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for DTC');
            await resetQuestion();
            log('⚠️ AI returned no mapping, retrying DTC');
            return solveDTC(doc, questionID);
        }

        for(const [statementText, categoryText] of Object.entries(parsed.mapping)){
            const option = [...doc.querySelectorAll('.option')].find(o=>normalizeText(o.querySelector('.optionChild')?.innerText||'')===normalizeText(statementText));
            if(!option){ log(`⚠️ Statement not found: "${statementText}"`); continue; }
            const targetIdx = categories.findIndex(c=>normalizeText(c)===normalizeText(categoryText));
            if(targetIdx===-1){ log(`⚠️ Category not found: "${categoryText}"`); continue; }
            const li = option.querySelector(`.keyboardDropDown li[data-positiontarget="${targetIdx+1}"]`);
            if(li){ simulateClick(li); log(`✅ DTC Applied: "${statementText}" -> "${categoryText}"`); await sleep(150); }
        }
        log('✅ DTC mapping completed');
    }

    async function solveMatchDrag(doc, questionID){
        retryCounters[questionID] = retryCounters[questionID] || 0;
        const optionDivs = [...doc.querySelectorAll('.optionDiv')];
        const dragItems = optionDivs.map(d=>d.querySelector('div')?.innerText.trim()||'');
        const dropTargets = [...doc.querySelectorAll('.descriptionText')].map(d=>d.innerText.trim());
        const question = doc.querySelector('#InstructionText')?.innerText.trim()||'';

        const prompt = `
Retry count: ${retryCounters[questionID]}.
Return ONLY JSON: { "mapping": { "Drag Text": "Target Text" } }.
Question: ${question}
Drag items:
${dragItems.map(t=>`- ${t}`).join('\n')}
Drop targets:
${dropTargets.map(t=>`- ${t}`).join('\n')}
No explanations.`;

        const parsed = safeParseJSON(await sendAI(prompt, retryCounters[questionID]));
        if(!parsed.mapping||Object.keys(parsed.mapping).length===0){
            retryCounters[questionID]++;
            if(retryCounters[questionID] > MAX_RETRIES) return log('⚠️ Max retries reached for Drag/Drop');
            await resetQuestion();
            log('⚠️ Drag/Drop AI returned no mapping, retrying');
            return solveMatchDrag(doc, questionID);
        }

        for(const [dragText,targetText] of Object.entries(parsed.mapping)){
            const div = optionDivs.find(d=>normalizeText(d.querySelector('div')?.innerText||'')===normalizeText(dragText));
            if(!div){ log(`⚠️ Drag item not found: "${dragText}"`); continue; }
            const targetIdx = dropTargets.findIndex(t=>normalizeText(t)===normalizeText(targetText));
            if(targetIdx===-1){ log(`⚠️ Drag target not found: "${targetText}"`); continue; }
            const li = div.querySelector(`.keyboardDropDown li[data-positiontarget="${targetIdx+1}"]`);
            if(li){ simulateClick(li); log(`✅ Drag/Drop Applied: "${dragText}" -> "${targetText}"`); await sleep(150); }
        }
        log('✅ Drag/Drop completed');
    }

    const waitFor = async (fn, timeout = 3000, interval = 100) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (fn()) return true;
            await sleep(interval);
        }
        return false;
    };

async function handleFeedbackNavigation() {
    const appeared = await waitFor(() => document.querySelector('#navigationFeedbackContainer'), 5000);
    if (!appeared) return;

    const container = document.querySelector('#navigationFeedbackContainer');
    const bgColor = container.style.background || '';
    const nextBtn = container.querySelector('#contentMain_FeedbackNextButton');
    const backBtn = container.querySelector('#contentMain_FeedbackPreviousButton');

    if (bgColor.includes('73, 170, 106')) {
        if (nextBtn) {
            log('✅ Correct answer detected, clicking Feedback Next');
            nextBtn.click();
            await sleep(600);
        }
    }
    else if (bgColor.includes('245, 61, 53')) {
        if (backBtn) {
            log('❌ Incorrect answer detected, clicking Feedback Back');
            backBtn.click();

            // Wait for page/question to reload
            await waitFor(() => document.querySelector('#contentMain_resetButton'), 5000);

            const resetBtn = document.querySelector('#contentMain_resetButton');
            if (resetBtn) {
                log('🔄 Clicking Reset after Back');
                resetBtn.click();
                await sleep(700);
            } else {
                log('⚠️ Reset button not found after Back');
            }
        }
    }
    else {
        log('⚠️ Neutral feedback, skipping feedback navigation');
    }
}

    const processCurrentQuestion = async () => {
        let doc = document;
        const frame = document.querySelector('iframe.iframe-content');
        if (frame?.contentDocument) doc = frame.contentDocument;

        const questionID = getQuestionID(doc);
        const type = detectQuestionType(doc);
        log('🔹 Detected question type:', type, 'ID:', questionID);

        try {
            switch (type) {
                case 'MULTIPLE_CHOICE': await solveMultipleChoice(doc, questionID); break;
                case 'DROPDOWN': await solveDropdown(doc, questionID); break;
                case 'DTC_CATEGORY': await solveDTC(doc, questionID); break;
                case 'MATCH_DRAG': await solveMatchDrag(doc, questionID); break;
                default: log('⚠️ Unknown/Skipped question type'); break;
            }
        } catch (e) {
            log('⚠️ Solver error, retrying', e);
            await sleep(300);
            return processCurrentQuestion();
        }

        const nextButton = document.querySelector('#nextButton');
        if (nextButton) { simulateClick(nextButton); log('➡️ Clicked main Next button'); await sleep(NEXT_PAGE_DELAY); }

        await handleFeedbackNavigation();

        if (autoSolveEnabled) processCurrentQuestion();
    };

    const injectButton = () => {
        const btn = document.createElement('button');
        btn.textContent='Auto Solve OFF';
        Object.assign(btn.style,{position:'fixed',top:'10px',right:'10px',padding:'8px 12px',background:'#FF4500',color:'white',border:'none',borderRadius:'4px',cursor:'pointer',zIndex:9999});
        document.body.appendChild(btn);

        btn.addEventListener('click', async e=>{
            autoSolveEnabled = !autoSolveEnabled;
            btn.textContent = autoSolveEnabled ? 'Auto Solve ON ✅' : 'Auto Solve OFF';
            if(autoSolveEnabled){ log('🚀 Auto solving enabled'); processCurrentQuestion(); }
        });
    };

    window.addEventListener('load',()=>{ injectButton(); log('✅ Auto AI Solver injected'); });
})();
