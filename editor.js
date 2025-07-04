const lang = new URLSearchParams(window.location.search).get('lang') || 'c';

    const snippets = {
      htmlcss: `<!--Default code to print "Hello World"-->
<h1 style="background-color:black;color:white;">
Hello World
</h1>`,

      c: `// Default C code with "Hello, World!"
#include <stdio.h>
int main()
{
    printf("Hello, World!");
    return 0;
}`,

      cpp: `// Default C++ code with "Hello, World!"
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,

      java: `// Default Java code with "Hello, World!"
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

      python: `# Default Python code with "Hello, World!"
print("Hello, World!")`,

      php: `<?php
// Default PHP code with "Hello, World!"
echo "Hello, World!";
?>`,

      ruby: `# Default Ruby Program
puts "Hello, World!"`,

      mysql: `-- Default SQL Query
SELECT 'Hello, SQL World!';`,
    };

    const langTitles = {
      htmlcss: 'HTML & CSS',
      c: 'C',
      cpp: 'C++',
      java: 'Java',
      python: 'Python',
      php: 'PHP',
      ruby: 'Ruby',
      mysql: 'MySQL',
    };

    document.getElementById('editor-title').innerText = `${langTitles[lang] || 'Code'} Code Editor`;
    document.getElementById('code-area').value = snippets[lang] || '';

    async function runCode() {
      const code = document.getElementById('code-area').value;
      const iframe = document.getElementById('output-frame');
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      doc.open();
      doc.write(`<pre>Compiling, please wait...</pre>`);
      doc.close();

      
      if (lang === 'htmlcss') {
        doc.open();
        doc.write(code);
        doc.close();
        return;
      }

      
      if (lang === 'mysql') {
        const res = await fetch('http://localhost:4000/compile-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: code }),
        }).then(res => res.json()).catch(err => ({ result: `Error: ${err.message}` }));

        doc.open();
        doc.write(`<pre>${typeof res.result === 'object' ? JSON.stringify(res.result, null, 2) : res.result}</pre>`);
        doc.close();
        return;
      }

  
      const res = await fetch('http://localhost:4000/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: code, language: lang }),
      }).then(res => res.json()).catch(err => ({ output: `Error: ${err.message}` }));

      doc.open();
      doc.write(`<pre>${res.output || res.error || 'No output'}</pre>`);
      doc.close();
    }