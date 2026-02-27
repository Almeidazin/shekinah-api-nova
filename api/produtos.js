export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const produtos = [
    { id: '1', nome: 'Pneu Teste', preco: 100 }
  ];
  
  res.status(200).json(produtos);
}
