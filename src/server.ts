import app from './app';

const PORT = process.env.PORT || 7002;

app.listen(PORT, () => console.log(`[🚪 ${PORT}] Link start!`));
