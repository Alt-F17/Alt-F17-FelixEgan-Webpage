import fs from 'fs';
const html = fs.readFileSync('public/getleadflowDOM.html', 'utf8');

const inputs = [...html.matchAll(/<input[^>]*>/gi)].map(m => m[0]);
inputs.forEach(input => {
    const placeholderMatch = input.match(/placeholder="([^"]+)"/);
    const valueMatch = input.match(/value="([^"]*)"/);
    if(placeholderMatch) console.log(`[${placeholderMatch[1]}] = ${valueMatch ? valueMatch[1] : 'none'}`);
});



