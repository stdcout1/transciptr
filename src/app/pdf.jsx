'use client'
import { Suspense, use } from "react";
import { parseTranscript } from "./parse";
import * as pdfjsLib from "pdfjs-dist/build/pdf"
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function getPdfText(data) {
    let doc = await pdfjsLib.getDocument({ data }).promise;
    let pageTexts = Array.from({ length: doc.numPages }, async (v, i) => {
        return (await (await doc.getPage(i + 1)).getTextContent()).items.map(token => token.str).join('');
    });
    return (await Promise.all(pageTexts)).join('');
}

function testPdf() {
    // Fetch the PDF and parse it into text as a single promise
    return fetch("http://localhost:3000/transcript.pdf")
        .then((response) => response.arrayBuffer())
        .then((buffer) => getPdfText(buffer));
}

function PdfContent({ promise }) {
    const data = use(promise); // Use the promise to suspend rendering until it's resolved
    let json = JSON.stringify(parseTranscript(data))
    console.log(json)
    return <div>{json.transcript}</div>;
}

export default function Pdf() {
    const pdfPromise = testPdf(); // Create a single promise for the PDF text
    return (
        <div>
            <Suspense fallback={<div>Loading PDF...</div>}>
                <PdfContent promise={pdfPromise} />
            </Suspense>
        </div>
    )
}
