// MathRenderer.jsx
// Орнату: npm install react-katex katex
// Осы файлды components/ папкаңа қой

import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

/**
 * Хабарлама мәтінін LaTeX формулалармен рендерлейді.
 * $...$ → inline формула
 * $$...$$ → block (жеке жол) формула
 * **...** → жирный мәтін
 */
const MathRenderer = ({ text }) => {
  if (!text) return null

  // Алдымен $$...$$ (block), содан кейін $...$ (inline) бөлеміз
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g)

  return (
    <span className="math-renderer">
      {parts.map((part, i) => {
        // Block формула: $$...$$
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.slice(2, -2).trim()
          return (
            <span key={i} className="math-block">
              <BlockMath
                math={latex}
                renderError={(error) => (
                  <span className="math-error">{part}</span>
                )}
              />
            </span>
          )
        }

        // Inline формула: $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const latex = part.slice(1, -1).trim()
          return (
            <InlineMath
              key={i}
              math={latex}
              renderError={() => <span className="math-error">{part}</span>}
            />
          )
        }

        // Жай мәтін — **bold** рендерлеу + жол аудару
        return <FormattedText key={i} text={part} />
      })}
    </span>
  )
}

// **bold** және \n рендерлейтін көмекші компонент
const FormattedText = ({ text }) => {
  const lines = text.split('\n')

  return (
    <>
      {lines.map((line, lineIdx) => {
        const boldParts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <span key={lineIdx}>
            {boldParts.map((segment, segIdx) => {
              if (segment.startsWith('**') && segment.endsWith('**')) {
                return <strong key={segIdx}>{segment.slice(2, -2)}</strong>
              }
              return <span key={segIdx}>{segment}</span>
            })}
            {lineIdx < lines.length - 1 && <br />}
          </span>
        )
      })}
    </>
  )
}

export default MathRenderer
