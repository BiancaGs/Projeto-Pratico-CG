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
var cameraPerspectiva, cameraPokeball;
var controls, scene, renderer;
var ambient;
var light;
var canvas = document.getElementById('modelo');

var ivysaur3D = new THREE.Object3D;
var bulbasaur3D = new THREE.Object3D;
var groudon3D = new THREE.Object3D;
var magnemite3D = new THREE.Object3D;
var pokeball3D = new THREE.Object3D;

var ivysaurCarregado = false;
var bulbasaurCarregado = false;
var groudonCarregado = false;
var magnemiteCarregado = false;
var pokeballCarregado = false;

var cameraAtiva = 0;


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

    var ASPECT_RATIO = window.innerWidth / window.innerHeight;
    var viewSize = 1080;

    // Camera PERSPECTIVA
    cameraPerspectiva = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.01, 1000); //1000
    cameraPerspectiva.position.set(10,8,4);
    cameraPerspectiva.updateMatrixWorld();

    // Camera Pokeball
    cameraPokeball = new THREE.PerspectiveCamera(45, ASPECT_RATIO, 0.01, 1000); //1000
    cameraPokeball.position.set(0,1,-2);
    cameraPokeball.updateMatrixWorld();
    cameraPokeball.lookAt(0,.75,0);

    // =======================================================
    // Cena
    // =======================================================
    
    scene = new THREE.Scene();
    scene.add(cameraPerspectiva);
    scene.add(cameraPokeball);
    
    
    light = new THREE.AmbientLight('white', 1.25);
    scene.add(light);

    
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

    var geo = new THREE.PlaneBufferGeometry(20, 20, 8, 8);
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
                
                object.scale.set(0.99, 0.99, 0.99);          // Escala
                object.position.set(posicaoAleatoria(), 0, posicaoAleatoria());                // Posição

                ivysaur3D = object;
                ivysaurCarregado = true;

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

                object.scale.set(0.025, 0.025, 0.025);         // Escala
                object.position.set(posicaoAleatoria(), 0.01, posicaoAleatoria());               // Posição
                object.rotateY(135);                           // Rotação

                bulbasaur3D = object;
                bulbasaurCarregado = true;

                scene.add(bulbasaur3D);
            },

            // Mostra o progresso
            function(xhr) {
                console.log( 'Bulbasaur ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
            }
        );

    });


    // GROUDON
    var objGroudon = new THREE.OBJLoader;
    objGroudon.setPath('assets/');
    objGroudon.load(
        
        // URL
        'groudon/groudon.obj', 
        
        // Chamado quando o objeto foi carregado
        function(object) {

            // As texturas vêm do MTL!

            // // Adiciona o shader
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });

            object.scale.set(0.1, 0.1, 0.1);            // Escala
            object.position.set(posicaoAleatoria(), 0.01, posicaoAleatoria());           // Posição
            object.rotateY(THREE.Math.degToRad(90));    // Rotação

            groudon3D = object;
            groudonCarregado = true;

            scene.add(groudon3D);
        },

        // Mostra o progresso
        function(xhr) {
            console.log( 'Groudon ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
        }
    );


    // MAGNEMITE
    var mtlMagnemite = new  THREE.MTLLoader;
    mtlMagnemite.setPath('assets/');
    mtlMagnemite.load('magnemite/Magnemite.mtl', function(materials) {
        
        materials.preload();
        
        var objMagnemite = new THREE.OBJLoader;
        objMagnemite.setMaterials(materials);
        objMagnemite.setPath('assets/');
        objMagnemite.load(
            
            // URL
            'magnemite/Magnemite.obj', 
            
            // Chamado quando o objeto foi carregado
            function(object) {

                // As texturas vêm do MTL!

                object.scale.set(0.003, 0.003, 0.003);         // Escala
                object.position.set(posicaoAleatoria(), 0.01, posicaoAleatoria());               // Posição
                object.rotateY(135);                           // Rotação

                magnemite3D = object;
                magnemiteCarregado = true;

                scene.add(magnemite3D);
            },

            // Mostra o progresso
            function(xhr) {
                console.log( 'Magnemite ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
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
                pokeballCarregado = true;

                scene.add(pokeball3D);
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

    controls = new THREE.OrbitControls(cameraPerspectiva, renderer.domElement);
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
    if (cameraAtiva == 0) {
        cameraPerspectiva.lookAt(scene.position);
        renderer.render(scene, cameraPerspectiva);
    }
    else {
        renderer.render(scene, cameraPokeball);
    }
}


// =======================================================
// INTERAÇÃO COM O USUÁRIO
// =======================================================


function Teclado() {

    var incremento = 0.1;
    var novaPosicao;

    // Teclas: W A S D

    switch (event.keyCode) {
        case 65:    // A : esquerda
            pokeball3D.position.x += incremento;
            cameraPokeball.position.x = pokeball3D.position.x;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 87:    // W : frente
            novaPosicao = pokeball3D.position.z + incremento;
            pokeball3D.position.z = novaPosicao;
            cameraPokeball.position.z = pokeball3D.position.z-1;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 68:    // D : direita
            pokeball3D.position.x -= incremento;
            cameraPokeball.position.x = pokeball3D.position.x;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 83:    // S : trás
            novaPosicao = pokeball3D.position.z - incremento;
            pokeball3D.position.z = novaPosicao;
            cameraPokeball.position.z = pokeball3D.position.z-1;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);

        break;
    
        default:
            break;
    }

}

$(document).ready(function() {

    $('#perspectiva').click(function() {

        cameraAtiva = 0;
               
    });
    
    $('#ortografica').click(function() {
        
        cameraAtiva = 1;

    });

});

function posicaoAleatoria(){
    var pos = Math.floor(Math.random() * 9);
    pos *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    return pos;
}