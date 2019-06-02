/// <reference path='node_modules/three/build/three.js' />

// Verifica se foi possível inicializar o WebGL
if (!WEBGL.isWebGLAvailable()) {
    var erro = WEBGL.getWebGLErrorMessage();
    alert(erro);
}

// Variáveis para utilização posterior
var container;
var camera, controls, scene, renderer;
var ambient;
var light;
var canvas = document.getElementById('modelo');

// Chamadas
init();
animate();


// =======================================================
// FUNÇÕES
// =======================================================

// Função init
function init() {

    // =======================================================
    // Recuperação do canvas
    // =======================================================

    container = document.createElement('div');
    document.body.appendChild(container);

    // =======================================================
    // Camera
    // =======================================================

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000); //1000
    camera.position.x = 4;
    camera.position.y = 4;
    camera.position.z = 0;
    
    // =======================================================
    // Cena
    // =======================================================

    scene = new THREE.Scene();
    ambient = new THREE.AmbientLight(0xcccccc, 0.4);//(0xffffff, 1.0);
    
    scene.add(ambient);
    scene.add(camera);

    
    // =======================================================
    // Plano
    // =======================================================

    var geo = new THREE.PlaneBufferGeometry(10, 10, 8, 8);
    var mat = new THREE.MeshBasicMaterial({ color: 'lightgrey', side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geo, mat);
    plane.rotateX( - Math.PI / 2);

    scene.add(plane);


    // =======================================================
    // Vertex e Fragment Shaders
    // =======================================================

    var vertexShader = document.getElementById("vertex-shader");
    var fragmentShader = document.getElementById("fragment-shader");

    var material = new THREE.ShaderMaterial({
        vertexShader: vertexShader.textContent,
        fragmentShader: fragmentShader.textContent
    });

    // =======================================================
    // Modelo
    // =======================================================
    
    var mtl = new  THREE.MTLLoader;
    mtl.setPath('assets/');
    mtl.load('ivysaur/Pokemon.mtl', function(materials) {

        materials.preload();

        var obj = new THREE.OBJLoader;
        obj.setMaterials(materials);
        obj.setPath('assets/');
        obj.load('ivysaur/Pokemon.obj', function(object) {
            
            // Adiciona o shading
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });

            scene.add(object);
        });

    });


    // =======================================================
    // Renderizador
    // =======================================================

    renderer = new THREE.WebGLRenderer({
        canvas: canvas, 
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('white'));

    container.appendChild(renderer.domElement);

    // =======================================================
    // Controles
    // =======================================================

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

}

// Função animate
function animate(){
    requestAnimationFrame(animate);
    render();
}

// Funcão render
function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}