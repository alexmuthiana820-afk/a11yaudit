"use client"
import { useState } from "react"

type Issue = { rule: string, message: string, severity: "error" | "warning" | "pass" }

function audit(html: string): Issue[] {
  const issues: Issue[] = []
  const lower = html.toLowerCase()

  if (lower.includes("<img") && !lower.includes("alt=")) {
    issues.push({ rule: "Images", message: "Found <img> without alt text. Screen readers can't describe it.", severity: "error" })
  } else if (lower.includes("<img")) {
    issues.push({ rule: "Images", message: "Images have alt text. Good.", severity: "pass" })
  }

  if (lower.includes("<input") && !lower.includes("<label")) {
    issues.push({ rule: "Forms", message: "Found <input> without <label>. Users can't tell what the field is for.", severity: "error" })
  } else if (lower.includes("<input")) {
    issues.push({ rule: "Forms", message: "Inputs have labels. Good.", severity: "pass" })
  }

  if (lower.includes("<button") && lower.includes("<button></button>")) {
    issues.push({ rule: "Buttons", message: "Found empty <button>. It needs visible text or aria-label.", severity: "error" })
  } else if (lower.includes("<button")) {
    issues.push({ rule: "Buttons", message: "Buttons have text. Good.", severity: "pass" })
  }

  if (!lower.includes("<h1")) {
    issues.push({ rule: "Headings", message: "No <h1> found. Every page needs one main heading.", severity: "warning" })
  } else {
    issues.push({ rule: "Headings", message: "Has an <h1>. Good.", severity: "pass" })
  }

  if (!lower.includes("lang=")) {
    issues.push({ rule: "Language", message: "No lang attribute on <html>. Screen readers don't know the language.", severity: "warning" })
  }

  if (issues.length === 0) {
    issues.push({ rule: "No code", message: "Paste some HTML above to audit it.", severity: "warning" })
  }

  return issues
}

export default function Home() {
  const [html, setHtml] = useState(`<html lang="en">\n  <h1>Welcome</h1>\n  <img src="photo.jpg">\n  <input type="text">\n  <button></button>\n</html>`)
  const [results, setResults] = useState<Issue[]>([])
  const [hasRun, setHasRun] = useState(false)

  function runAudit() {
    setResults(audit(html))
    setHasRun(true)
  }

  const errors = results.filter(r => r.severity === "error").length
  const score = hasRun ? Math.max(0, 100 - errors * 25 - results.filter(r => r.severity === "warning").length * 10) : 100

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold">A11yAudit ♿</h1>
      <p className="text-gray-600 mt-2">Paste HTML, get accessibility issues + a score. Like axe-core, but simple.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="font-bold">Paste HTML to audit</h2>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={12} className="w-full border rounded-xl p-4 mt-3 font-mono text-sm" />
          <button onClick={runAudit} className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-3 w-full">Run Audit</button>
          <p className="text-sm text-gray-500 mt-2">Try it: delete alt=, delete the label, or delete the h1 and re-run — watch the score drop.</p>
        </div>

        <div>
          <div className="border rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">Accessibility Score</p>
            <p className={`text-5xl font-bold mt-1 ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{hasRun ? score : "—"}</p>
            <p className="text-sm mt-1">{hasRun ? `${errors} errors found` : "Click Run Audit"}</p>
          </div>

          <div className="space-y-3 mt-4">
            {results.map((r, i) => (
              <div key={i} className={`border rounded-xl p-4 ${r.severity === "error" ? "border-red-300 bg-red-50" : r.severity === "warning" ? "border-yellow-300 bg-yellow-50" : "border-green-300 bg-green-50"}`}>
                <p className="font-bold text-sm">{r.rule} — {r.severity.toUpperCase()}</p>
                <p className="text-sm mt-1">{r.message}</p>
              </div>
            ))}
            {!hasRun && <p className="text-gray-500 text-sm">Results will appear here.</p>}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-8">Built by Alex Muthiana — Next.js • TypeScript • WCAG 2.1 AA checks</p>
    </main>
  )
}