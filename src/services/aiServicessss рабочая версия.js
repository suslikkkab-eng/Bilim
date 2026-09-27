// AI Service — Google Gemini 2.0 Flash

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

// Мұнда өз API key-іңді жаз:
const GEMINI_API_KEY = 'AIzaSyBxNuXTuyhh3WFBNXaICM9YHyOfROGnSPI'

const getSystemPrompt = (subjectName, userName) => `Сіз БілімAI — Қазақстанның ЕНТ емтиханына дайындықта көмектесетін AI-репетиторсыз.

Пайдаланушы аты: ${userName || 'Оқушы'}
Ағымдағы пән: ${subjectName}

Нұсқаулар:
- Тек қазақ тілінде жауап беріңіз
- Түсінікті, қарапайым тілмен жазыңыз
- Мысалдармен түсіндіріңіз
- ЕНТ форматына сай болыңыз
- Мадақтаңыз және ынталандырыңыз
- Формулаларды, есептерді дұрыс жазыңыз
- Жауап 3-4 абзацтан аспасын (егер ұзын түсіндірме керек болмаса)
- Emoji қолданыңыз — оқушыға жағымды болсын`

export const sendChatMessage = async ({ messages, subjectName, userName }) => {
  try {
    // Conversation history үшін contents жаса
    const systemPrompt = getSystemPrompt(subjectName, userName)
    
    // Gemini format: system + history + last message
    const contents = []
    
    // Алдыңғы хабарламалар тарихы (соңғы 10)
    const history = messages.slice(-10)
    
    for (const msg of history) {
      contents.push({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topP: 0.9,
        }
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.error?.message || `API қатесі: ${response.status}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Бос жауап келді')
    return text

  } catch (err) {
    console.error('Gemini API Error:', err)
    // Fallback to simulation if API fails
    return simulateAIResponse(messages[messages.length - 1]?.content, subjectName)
  }
}

// Резервтік симуляция (API жұмыс істемесе)
const simulateAIResponse = async (userMessage, subjectName) => {
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 600))
  const lower = userMessage?.toLowerCase() || ''

  if (lower.includes('сәлем') || lower.includes('привет') || lower.includes('hello')) {
    return `Сәлеметсіз бе! 👋 Мен БілімAI — **${subjectName}** пәні бойынша репетиторыңызбын.\n\nСұрақ қойыңыз, тест тапсырғыңыз келсе — айтыңыз! 🎯`
  }
  if (lower.includes('формул')) {
    return `**Формулалар** өте маңызды! 📐\n\nЕНТ-те формулаларды жаттап алу керек, бірақ **түсіну** одан да маңыздырақ.\n\nҚандай формуланы нақтырақ түсіндірейін?`
  }
  const responses = [
    `Жақсы сұрақ! 💡 **${subjectName}** пәні бойынша бұл тақырып ЕНТ-те жиі кездеседі.\n\nТолық түсіндіру үшін нақтырақ айтып беріңіз — мен дайынмын! 🚀`,
    `Өте дұрыс сұрақ қойдыңыз! 🎯\n\n**${subjectName}** пәнінде бұл концепция маңызды. Кезең-кезеңмен талдайық!\n\nЖалғастырыңыз, сіз жақсы дайындалып жатырсыз! 💪`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
