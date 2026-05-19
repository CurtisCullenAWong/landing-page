import ollama from 'ollama'

async function main() {
  const response = await ollama.chat({
    model: 'curtiscullenagustinwong/company-chatbot:latest',
    messages: [
      {
        role: 'user',
        content: 'Why is the sky blue?'
      }
    ],
    stream: false
  })

  console.log(response.message.content)
}

main().catch(console.error)