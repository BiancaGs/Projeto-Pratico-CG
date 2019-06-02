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
    
    scene.add(camera);
    scene.add(ambient);

    
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

    // !REMOVER: Helper para os eixos 
    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    // The X axis is red. The Y axis is green. The Z axis is blue.
    
    // IVYSAUR
    var mtlIvysaur = new  THREE.MTLLoader;
    mtlIvysaur.setPath('assets/');
    mtlIvysaur.load('ivysaur/Pokemon.mtl', function(materials) {
        
        materials.preload();
        
        var objIvysaur = new THREE.OBJLoader;
        objIvysaur.setMaterials(materials);
        objIvysaur.setPath('assets/');
        objIvysaur.load('ivysaur/Pokemon.obj', function(object) {
            
            // Adiciona o shading
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });

            var ivysaur3D = new THREE.Object3D;
            ivysaur3D.add(object);
            ivysaur3D.scale.set(0.99, 0.99, 0.99);          // Escala
            ivysaur3D.position.set(0, 0, 2);                // Posição

            scene.add(ivysaur3D);
        });

    });

    // BULBASAUR
    var objBulbasaur = new THREE.OBJLoader;
    // objBulbasaur.setMaterials(materials);
    objBulbasaur.setPath('assets/');
    objBulbasaur.load('bulbasaur/bulbasaur.obj', function(object) {
        
        // Adiciona o shading
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });

        var bulbasaur3D = new THREE.Object3D;
        bulbasaur3D.add(object);
        bulbasaur3D.scale.set(0.025, 0.025, 0.025);         // Escala
        bulbasaur3D.position.set(2, 0, 2);                  // Posição
        bulbasaur3D.rotateY(135);                           // Rotação

        scene.add(bulbasaur3D);
    });
    
    // POKEBOLA
    var mtlPokeball = new  THREE.MTLLoader;
    mtlPokeball.setPath('assets/');
    mtlPokeball.load('pokeball/pokeball.mtl', function(materials) {

        materials.preload();

        var objPokeball = new THREE.OBJLoader;
        objPokeball.setMaterials(materials);
        objPokeball.setPath('assets/');
        objPokeball.load('pokeball/pokeball.obj', function(object) {

            var pokeball3D = new THREE.Object3D;
            pokeball3D.add(object);
            pokeball3D.scale.set(0.0025, 0.0025, 0.0025);   // Escala

            scene.add(pokeball3D);
                        
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


// =======================================================
// INTERAÇÃO COM O USUÁRIO
// =======================================================

$(document).ready(function() {

    $('#perspectiva').click(function() {
    
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000); //1000
        camera.position.x = 4;
        camera.position.y = 4;
        camera.position.z = 0;
        
        renderer.clear();
        renderer.render(scene, camera);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;
    
    });
    
    $('#ortografica').click(function() {
    
        var viewSize = 1080;
        var aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.OrthographicCamera( aspect*viewSize / -2, aspect*viewSize / 2, viewSize / 2, viewSize / -2, 1, 1000 );
        camera.position.x = -5;
        camera.position.y = 5;
        camera.position.z = 0;
        camera.zoom = 120;
        camera.updateProjectionMatrix();
        
        renderer.clear();
        renderer.render(scene, camera);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;
    
    });

});
