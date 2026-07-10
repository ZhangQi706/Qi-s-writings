const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 直接提供静态文件

const DATA_FILE = path.join(__dirname, 'data', 'works.json');

// 读取数据
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, '[]');
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 获取所有作品（可按分类过滤）
app.get('/api/works', (req, res) => {
    const works = readData();
    const category = req.query.category;
    if (category) {
        return res.json(works.filter(w => w.category === category));
    }
    res.json(works);
});

// 获取单个作品
app.get('/api/works/:id', (req, res) => {
    const works = readData();
    const work = works.find(w => w.id == req.params.id);
    if (!work) return res.status(404).json({ error: 'Not found' });
    res.json(work);
});

// 新增作品
app.post('/api/works', (req, res) => {
    const works = readData();
    const newWork = {
        id: Date.now(),
        title: req.body.title,
        category: req.body.category, // "essay" | "poem" | "novel"
        content: req.body.content,
        createdAt: new Date().toISOString()
    };
    works.push(newWork);
    writeData(works);
    res.status(201).json(newWork);
});

// 更新作品
app.put('/api/works/:id', (req, res) => {
    const works = readData();
    const index = works.findIndex(w => w.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    works[index].title = req.body.title || works[index].title;
    works[index].content = req.body.content || works[index].content;
    works[index].category = req.body.category || works[index].category;
    writeData(works);
    res.json(works[index]);
});

// 删除作品
app.delete('/api/works/:id', (req, res) => {
    let works = readData();
    works = works.filter(w => w.id != req.params.id);
    writeData(works);
    res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});