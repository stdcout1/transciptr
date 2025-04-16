'use client'
import { useEffect, useState } from "react";
import { parseTranscript } from "./parse";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function getPdfText(data) {
    let doc = await pdfjsLib.getDocument({ data }).promise;
    let pageTexts = Array.from({ length: doc.numPages }, async (v, i) => {
        return (await (await doc.getPage(i + 1)).getTextContent()).items.map(token => token.str).join('');
    });
    return (await Promise.all(pageTexts)).join('');
}

export default function Pdf() {
    const [text, setText] = useState(null);

    useEffect(() => {
        async function fetchPdf() {
            const response = await fetch("/transcript.pdf"); // use relative URL for public asset
            const buffer = await response.arrayBuffer();
            const rawText = await getPdfText(buffer);
            const parsed = parseTranscript(rawText);
            setText(parsed.transcript);
        }

        fetchPdf();
    }, []);

    if (!text) return <div>Loading PDF...</div>;

    return <div>{JSON.stringify(text)}</div>;
}

