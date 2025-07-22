// Инициализация сцены
const container = document.getElementById('logo-container');
const loadingIndicator = document.getElementById('loading');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Настройка рендерера
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0);
container.appendChild(renderer.domElement);

// Позиция камеры
camera.position.z = 5;

// Освещение
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Параметры вращения
let autoRotate = true;
let rotationSpeed = 0.01;
let logo;

// Показать индикатор загрузки
loadingIndicator.style.display = 'block';

// Загрузка OBJ модели
const objLoader = new THREE.OBJLoader();

// Если у вас есть файл материалов (.mtl), используйте MTLLoader
// const mtlLoader = new THREE.MTLLoader();
// mtlLoader.load('assets/logo.mtl', function(materials) {
//     materials.preload();
//     objLoader.setMaterials(materials);
//     loadObjModel();
// });

// Если нет файла материалов, загружаем напрямую OBJ
loadObjModel();

function loadObjModel() {
    objLoader.load(
        'assets/logo.obj',
        function (object) {
            logo = object;
            
            // Центрируем модель
            const box = new THREE.Box3().setFromObject(logo);
            const center = box.getCenter(new THREE.Vector3());
            logo.position.sub(center);
            
            // Масштабируем модель, если нужно
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            logo.scale.set(scale, scale, scale);
            
            scene.add(logo);
            loadingIndicator.style.display = 'none';
        },
        function (xhr) {
            // Прогресс загрузки
            const percentLoaded = (xhr.loaded / xhr.total * 100).toFixed(2);
            loadingIndicator.textContent = `Загрузка модели... ${percentLoaded}%`;
        },
        function (error) {
            console.error('Ошибка загрузки модели:', error);
            loadingIndicator.textContent = 'Ошибка загрузки модели';
        }
    );
}

// Анимация
function animate() {
    requestAnimationFrame(animate);
    
    if (autoRotate && logo) {
        logo.rotation.y += rotationSpeed;
    }
    
    renderer.render(scene, camera);
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Остановка/запуск вращения при клике
window.addEventListener('click', () => {
    autoRotate = !autoRotate;
});

// Запуск анимации
animate();