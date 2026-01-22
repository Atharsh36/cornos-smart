import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CronoSmart Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});