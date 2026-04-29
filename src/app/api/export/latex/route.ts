import { NextResponse } from "next/server";
import { SECTION_STEPS } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { universityName, modality, programa, sections, format } = body;

    // Default formatting if none provided
    const font = format?.font || "Times New Roman";
    const size = format?.size || 12;
    const lineSpacing = format?.lineHeight || 1.5;
    const margins = format?.margins || { top: 3, left: 3, bottom: 2.5, right: 2.5 };

    // Function to escape LaTeX special characters
    const escapeLatex = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/</g, "\\textless{}")
        .replace(/>/g, "\\textgreater{}")
        // Bold formatting conversion (**text**) -> \textbf{text}
        .replace(/\*\*(.*?)\*\*/g, "\\textbf{$1}")
        // Italic formatting conversion (*text*) -> \textit{text}
        .replace(/\*(.*?)\*/g, "\\textit{$1}")
        // Newlines to LaTeX newlines
        .replace(/\n\n/g, "\n\n") // Paragraph breaks
        .replace(/\n/g, " \\\\ \n"); // Single line breaks
    };

    const title = sections?.titulo ? sections.titulo.replace(/\*\*/g, "").split("\n")[0] : "Documento de Investigación";

    // LaTeX Document Template
    const latexDocument = `\\documentclass[${size}pt,a4paper]{article}

% --- Packages ---
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{times} % Assuming Times New Roman approximation

% --- Page Setup ---
\\geometry{
  top=${margins.top}cm,
  bottom=${margins.bottom}cm,
  left=${margins.left}cm,
  right=${margins.right}cm
}

% --- Line Spacing ---
\\setstretch{${lineSpacing}}

\\begin{document}

% --- Title Page ---
\\begin{titlepage}
    \\centering
    \\vspace*{2cm}
    
    {\\Large \\textbf{${escapeLatex(universityName)}}}\\\\[0.5cm]
    {\\large ${escapeLatex(programa)}}\\\\[2cm]
    
    {\\Large \\textbf{${escapeLatex(title)}}}\\\\[2cm]
    
    {\\large \\textbf{Modalidad:} ${escapeLatex(modality)}}\\\\[3cm]
    
    \\vfill
    
    {\\large \\today}
\\end{titlepage}

\\newpage
\\tableofcontents
\\newpage

% --- Content ---
${SECTION_STEPS.filter(step => sections[step.key]).map(step => `
\\section{${escapeLatex(step.label)}}
${escapeLatex(sections[step.key])}
`).join("\n\n")}

\\end{document}
`;

    return new NextResponse(latexDocument, {
      status: 200,
      headers: {
        "Content-Type": "application/x-tex",
        "Content-Disposition": `attachment; filename="perfil_investigacion.tex"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error generating LaTeX: ${message}` }, { status: 500 });
  }
}
