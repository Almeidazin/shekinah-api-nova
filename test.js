// api/test.js
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const status = {
        mensagem: "API de teste funcionando!",
        database_url: process.env.DATABASE_URL ? "Configurada ✅" : "Ausente ❌",
        ambiente: process.env.VERCEL_ENV || 'development',
        timestamp: new Date().toISOString()
    };
    
    res.status(200).json(status);
}
