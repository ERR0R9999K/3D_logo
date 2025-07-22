// Инициализация сцены, камеры и рендерера
const container = document.getElementById('logo-container');
const loadingIndicator = document.getElementById('loading');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true // Прозрачный фон, если нужно
});

// Настройка рендерера
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0); // Цвет фона
renderer.setPixelRatio(window.devicePixelRatio); // Для Retina-экранов
container.appendChild(renderer.domElement);

// Позиция камеры
camera.position.z = 5;

// Освещение
const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Мягкий окружающий свет
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight1.position.set(1, 1, 1);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight2.position.set(-1, -1, -1);
scene.add(directionalLight2);

// Параметры вращения
let autoRotate = true;
let rotationSpeed = 0.01;
let logo;

// Показать индикатор загрузки
loadingIndicator.style.display = 'block';

// Функция для загрузки модели
function loadModel() {
    // Сначала загружаем материалы (MTL)
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('assets/models/');
    
    mtlLoader.load('logo.mtl', function(materials) {
        materials.preload();
        
        // Настройка материалов для коррекции прозрачности (если нужно)
        for (const material of Object.values(materials.materials)) {
            material.side = THREE.DoubleSide; // Отображать обе стороны
            material.transparent = true; // Если есть прозрачность
            material.alphaTest = 0.1; // Для корректного отображения прозрачности
        }
        
        // Затем загружаем OBJ модель
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('assets/models/');
        
        objLoader.load('logo.obj', function(object) {
            logo = object;
            
            // Центрирование модели
            const box = new THREE.Box3().setFromObject(logo);
            const center = box.getCenter(new THREE.Vector3());
            logo.position.sub(center);
            
            // Масштабирование модели
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            logo.scale.set(scale, scale, scale);
            
            // Добавляем модель в сцену
            scene.add(logo);
            
            // Скрываем индикатор загрузки
            loadingIndicator.style.display = 'none';
            
            // Запускаем анимацию после загрузки
            animate();
        }, 
        // Прогресс загрузки
        function(xhr) {
            const percentLoaded = Math.round((xhr.loaded / xhr.total) * 100);
            loadingIndicator.textContent = `Загрузка модели... ${percentLoaded}%`;
        },
        // Обработка ошибок
        function(error) {
            console.error('Ошибка загрузки модели:', error);
            loadingIndicator.textContent = 'Ошибка загрузки модели';
            loadingIndicator.style.color = 'red';
        });
    },
    // Ошибка загрузки MTL
    function(error) {
        console.error('Ошибка загрузки материалов:', error);
        loadingIndicator.textContent = 'Ошибка загрузки материалов';
        loadingIndicator.style.color = 'red';
    });
}

// Анимация
function animate() {
    requestAnimationFrame(animate);
    
    // Вращение модели
    if (autoRotate && logo) {
        logo.rotation.y += rotationSpeed;
    }
    
    renderer.render(scene, camera);
}

// Обработка изменения размера окна
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize);

// Управление вращением кликом
window.addEventListener('click', () => {
    autoRotate = !autoRotate;
});

// Загрузка модели при запуске
loadModel();

// Обработка ошибок текстуры
THREE.DefaultLoadingManager.onError = function(url) {
    console.error('Ошибка загрузки текстуры:', url);
};
