// AI Service — Hugging Face Router (DeepSeek-V3) + YouTube

import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: import.meta.env.VITE_HF_TOKEN,
  dangerouslyAllowBrowser: true,
})

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

const getSystemPrompt = (subjectName, userName) => `Сіз БілімAI репетиторсыз.

Пайдаланушы аты: ${userName || 'Оқушы'}
Ағымдағы пән: ${subjectName}

СЕН ТЕК "${subjectName}" ПӘНІ БОЙЫНША ҒАНА ЖАУАП БЕРЕСІҢ.

Егер сұрақ "${subjectName}" пәніне қатысты БОЛМАСА — басқа ештеңе түсіндірме, тек мынаны жаз:
"Бұл сұрақ ${subjectName} пәніне кірмейді. ${subjectName} бойынша сұрақ қойыңыз! 😊"

Егер сұрақ "${subjectName}" пәніне қатысты БОЛСА:
- Тек қазақ тілінде жауап бер
- Түсінікті, қарапайым тілмен жаз
- ЕНТ форматына сай бол
- Мадақта және ынталандыр
- Emoji қолдан
- Markdown белгілерін ҚОЛДАНБА: ###, ##, **, --, --- болмасын, тек таза мәтін жаз`

// YouTube-тен тақырыпқа қатысты видео іздеу
export const searchYouTubeVideos = async (query, subjectName) => {
  try {
    const searchQuery = `${subjectName} ${query} ЕНТ қазақша`
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=3&relevanceLanguage=kk&key=${YOUTUBE_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    return (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }))
  } catch (err) {
    console.error('YouTube API Error:', err)
    return []
  }
}

export const sendChatMessage = async ({ messages, subjectName, userName }) => {
  try {
    const systemPrompt = getSystemPrompt(subjectName, userName)

    const history = messages.slice(-10).map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    }))

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3-0324:novita',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })

    const text = completion.choices?.[0]?.message?.content
    if (!text) throw new Error('Бос жауап келді')
    return text

  } catch (err) {
    console.error('HF API Error:', err)
    return simulateAIResponse(messages[messages.length - 1]?.content, subjectName)
  }
}

const simulateAIResponse = async (userMessage, subjectName) => {
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 600))
  const lower = userMessage?.toLowerCase() || ''

  if (lower.includes('сәлем') || lower.includes('привет') || lower.includes('hello')) {
    return `Сәлеметсіз бе! Мен БілімAI — ${subjectName} пәні бойынша репетиторыңызбын.\n\nСұрақ қойыңыз, тест тапсырғыңыз келсе — айтыңыз! 🎯`
  }
  return `Жақсы сұрақ! ${subjectName} пәні бойынша бұл тақырып ЕНТ-те жиі кездеседі.\n\nТолық түсіндіру үшін нақтырақ айтып беріңіз — мен дайынмын! 🚀`
}
