/// <reference path='node_modules/three/build/three.js' />
/// <reference path='node_modules/three/examples/js/WebGL.js' />
/// <reference path='node_modules/three/examples/js/loaders/OBJLoader.js' />
/// <reference path='node_modules/three/examples/js/loaders/MTLLoader.js' />
/// <reference path='node_modules/three/examples/js/controls/OrbitControls.js' />

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

var pokeball3D = new THREE.Object3D;

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
    camera.position.set(4,4,0);
    
    // =======================================================
    // Cena
    // =======================================================
    
    scene = new THREE.Scene();
    
    scene.add(camera);

    light = new THREE.AmbientLight( 'white' ); // soft white light
    scene.add( light );
    
    // =======================================================
    // Plano
    // =======================================================

    var texturaPlano = new THREE.ImageUtils.loadTexture('img/grass_1.jpg');
    texturaPlano.wrapS = texturaPlano.wrapT = THREE.RepeatWrapping;
    texturaPlano.repeat.set(4, 4);
    var materialPlano = new THREE.MeshBasicMaterial({
        map: texturaPlano,
        side: THREE.DoubleSide
    });

    var geo = new THREE.PlaneBufferGeometry(10, 10, 8, 8);
    var plane = new THREE.Mesh(geo, materialPlano);
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
    //? The X axis is red. The Y axis is green. The Z axis is blue.

    
    // Texturas
    var loader = new THREE.TextureLoader();

    var materialIvysaur = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        specular: 0x333333,
        shininess: 15,
        map: loader.load("assets/ivysaur/textures/Final_Pokemon_Diffuse.jpg"),
        specularMap: loader.load("assets/ivysaur/textures/Final_Pokemon_Specular.jpg"),
        normalMap: loader.load("assets/ivysaur/textures/Final_Pokemon_Normal.jpg"),
        alphaMap: loader.load("assets/ivysaur/textures/Final_Pokemon_Glossiness.jpg")
    });
    

    // IVYSAUR
    var mtlIvysaur = new  THREE.MTLLoader;
    mtlIvysaur.setPath('assets/');
    mtlIvysaur.load('ivysaur/Pokemon.mtl', function(materials) {
        
        materials.preload();
        
        var objIvysaur = new THREE.OBJLoader;
        objIvysaur.setMaterials(materials);
        objIvysaur.setPath('assets/');
        objIvysaur.load(
            
            // URL
            'ivysaur/Pokemon.obj', 
            
            // Chamado quando o objeto foi carregado
            function(object) {
                
                // Adiciona a textura
                object.traverse(function (node) {
                    if ( node.isMesh ) node.material = materialIvysaur;
                });

                // // Adiciona o shader
                // object.traverse(function(child) {
                //     if (child instanceof THREE.Mesh) {
                //         child.material = material;
                //     }
                // });

                var ivysaur3D = new THREE.Object3D;
                ivysaur3D.add(object);
                ivysaur3D.scale.set(0.99, 0.99, 0.99);          // Escala
                ivysaur3D.position.set(0, 0, 2);                // Posição


                scene.add(ivysaur3D);
            },

            // Mostra o progresso
            function(xhr) {
                console.log( 'Ivysaur ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
            }
        );

    });


    // BULBASAUR
    var mtlBulbasaur = new  THREE.MTLLoader;
    mtlBulbasaur.setPath('assets/');
    mtlBulbasaur.load('bulbasaur/Bulbasaur/bulbasaur.mtl', function(materials) {
        
        materials.preload();
        
        var objBulbasaur = new THREE.OBJLoader;
        objBulbasaur.setMaterials(materials);
        objBulbasaur.setPath('assets/');
        objBulbasaur.load(
            
            // URL
            'bulbasaur/Bulbasaur/bulbasaur.obj', 
            
            // Chamado quando o objeto foi carregado
            function(object) {

                // As texturas vêm do MTL!

                var bulbasaur3D = new THREE.Object3D;
                bulbasaur3D.add(object);
                bulbasaur3D.scale.set(0.025, 0.025, 0.025);         // Escala
                bulbasaur3D.position.set(3, 0.01, 1);               // Posição
                bulbasaur3D.rotateY(135);                           // Rotação


                scene.add(bulbasaur3D);
            },

            // Mostra o progresso
            function(xhr) {
                console.log( 'Bulbasaur ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
            }
        );

    });

    
    // POKEBOLA
    var mtlPokeball = new  THREE.MTLLoader;
    mtlPokeball.setPath('assets/');
    mtlPokeball.load('pokeball/pokeball.mtl', function(materials) {

        materials.preload();

        var objPokeball = new THREE.OBJLoader;
        objPokeball.setMaterials(materials);
        objPokeball.setPath('assets/');
        objPokeball.load(
            
            // URL
            'pokeball/pokeball.obj', 
            
            // Chamado quando o objeto foi carregado
            function(object) {

                // Propriedades do objeto
                object.scale.set(0.0025, 0.0025, 0.0025);       // Escala

                pokeball3D = object;

                scene.add(object);   
            },

            // Mostra o progresso
            function(xhr) {
                console.log( 'Pokeball ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
            }
        );

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
    controls.enableZoom = true;


    // =======================================================
    // Movimentação
    // =======================================================

    document.addEventListener('keydown', Teclado, false);           // Adiciona um event listener

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


function Teclado() {

    var velocidade = 0.1;

    // Teclas: W A S D

    switch (event.keyCode) {
        case 65:    // A : esquerda
            pokeball3D.position.x += velocidade;
            break;

        case 87:    // W : cima
            pokeball3D.position.y += velocidade;
            break;

        case 68:    // D : direita
            pokeball3D.position.x -= velocidade;
            break;

        case 83:    // S : baixo
            pokeball3D.position.y -= velocidade;
        break;
    
        default:
            break;
    }

}

$(document).ready(function() {

    $('#perspectiva').click(function() {
    
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000); //1000
        camera.position.set(4,4,0);
        
        renderer.clear();
        renderer.render(scene, camera);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
    
    });
    
    $('#ortografica').click(function() {
    
        var viewSize = 1080;
        var aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.OrthographicCamera( aspect*viewSize / -2, aspect*viewSize / 2, viewSize / 2, viewSize / -2, 1, 1000 );
        camera.position.set(-5,5,0);
        camera.zoom = 120;
        camera.updateProjectionMatrix();
        
        renderer.clear();
        renderer.render(scene, camera);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
    
    });

});

