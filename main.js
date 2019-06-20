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

// Câmera
var cameraPerspectiva, cameraPokeball;
var cameraAtiva = 0;

// Controles
var controls, scene, renderer;

// Luz e sombra
var ambient;
var light, lightHelper, shadowHelper;

// Canvas
var canvas = document.getElementById('modelo');

// Objetos
var ivysaur3D = new THREE.Object3D;
var bulbasaur3D = new THREE.Object3D;
var groudon3D = new THREE.Object3D;
var magnemite3D = new THREE.Object3D;
var pokeball3D = new THREE.Object3D;

// Para uso do loader
var ivysaurCarregado = false;
var bulbasaurCarregado = false;
var groudonCarregado = false;
var magnemiteCarregado = false;
var pokeballCarregado = false;
var flagCarregado = 0;

var porcIvysaur = 0, porcBulba = 0, porcGroudon = 0, porcMagnemite = 0, porcPokeball = 0;
var porcentagem = 0;    // Média das porcentagens


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
    // Renderizador
    // =======================================================

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('white'));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.shadowMapSoft = true;

    renderer.physicallyCorrectLights = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    // renderer.toneMapping = ReinhardToneMapping;

    container.appendChild(renderer.domElement);


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
    scene.background = new THREE.Color('black');

    scene.add(cameraPerspectiva);
    scene.add(cameraPokeball);
    
    // ambient = new THREE.AmbientLight('white', 1.25);
    // scene.add(ambient);

    light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(20, 20, 20);
    light.castShadow = true;
    light.shadow.camera = new THREE.PerspectiveCamera(45, ASPECT_RATIO, 0.01, 1000);
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);
    scene.add(light.target);

    // Helper da sombra
    var shadowHelper = new THREE.CameraHelper( light.shadow.camera );
    scene.add( shadowHelper );

    // Helper da luz
    lightHelper = new THREE.DirectionalLightHelper( light, 5, 'white');
    scene.add( lightHelper );

    
    // =======================================================
    // GUI
    // =======================================================

    var gui = new dat.GUI();
    gui.add(light, 'intensity', 0, 10, 0.01);                           // Controle da intensidade
    criarGUILuz(gui, light.position, 'position', updateLight);          // Para a luz
    // criarGUILuz(gui, light.target.position, 'target', updateLight);  // Para o alvo da luz

    
    // =======================================================
    // Plano
    // =======================================================

    var texturaPlano = new THREE.TextureLoader().load('img/grass_1.jpg');
    texturaPlano.wrapS = texturaPlano.wrapT = THREE.RepeatWrapping;
    texturaPlano.repeat.set(4, 4);
    texturaPlano.anisotropy = 16; // filtro anisotrópico

    var materialPlano = new THREE.MeshPhongMaterial({
        map: texturaPlano,
        side: THREE.DoubleSide
    });

    var geo = new THREE.PlaneBufferGeometry(20, 20, 8, 8);
    var plane = new THREE.Mesh(geo, materialPlano);
    plane.receiveShadow = true;
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

                // Sombra
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
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
                porcIvysaur = xhr.loaded / xhr.total * 100;
                porcentagem = (porcIvysaur + porcBulba + porcGroudon + porcMagnemite + porcPokeball) / 5;
                console.log(porcentagem);
                
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

                // Sombra
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
                });

                object.scale.set(0.025, 0.025, 0.025);         // Escala
                object.position.set(posicaoAleatoria(), 0.01, posicaoAleatoria());               // Posição
                object.rotateY(135);                           // Rotação

                bulbasaur3D = object;
                bulbasaurCarregado = true;

                scene.add(bulbasaur3D);
            },

            // Mostra o progresso
            function(xhr) {
                porcBulba = xhr.loaded / xhr.total * 100;
                porcentagem = (porcIvysaur + porcBulba + porcGroudon + porcMagnemite + porcPokeball) / 5;
                console.log(porcentagem);
                
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

            // Sombra
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

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
            porcGroudon = xhr.loaded / xhr.total * 100;
            porcentagem = (porcIvysaur + porcBulba + porcGroudon + porcMagnemite + porcPokeball) / 5;
            console.log(porcentagem);
            
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

                // Sombra
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
                });

                object.scale.set(0.003, 0.003, 0.003);         // Escala
                object.position.set(posicaoAleatoria(), 0.01, posicaoAleatoria());               // Posição
                object.rotateY(135);                           // Rotação

                magnemite3D = object;
                magnemiteCarregado = true;

                scene.add(magnemite3D);
            },

            // Mostra o progresso
            function(xhr) {
                porcMagnemite = xhr.loaded / xhr.total * 100;
                porcentagem = (porcIvysaur + porcBulba + porcGroudon + porcMagnemite + porcPokeball) / 5;
                console.log(porcentagem);
                
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

                // Sombra
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
                });

                // Propriedades do objeto
                object.scale.set(0.0025, 0.0025, 0.0025);       // Escala

                pokeball3D = object;
                pokeballCarregado = true;

                scene.add(pokeball3D);
            },

            // Mostra o progresso
            function(xhr) {
                porcPokeball = xhr.loaded / xhr.total * 100;
                porcentagem = (porcIvysaur + porcBulba + porcGroudon + porcMagnemite + porcPokeball) / 5;
                console.log(porcentagem);
                
                console.log( 'Pokeball ' + ( xhr.loaded / xhr.total * 100 ) + '% carregado' );
            }
        );

    });


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

    // Event listeners
    document.addEventListener('keydown', Teclado, false);
    window.addEventListener( 'resize', onWindowResize, false );

}

// Função animate
function animate(){
    requestAnimationFrame(animate);
    render();
}

// Funcão render
function render() {
    if (flagCarregado == 0) {
        if (ivysaurCarregado && bulbasaurCarregado && groudonCarregado && magnemiteCarregado && pokeballCarregado) {
            flagCarregado = 1;
        }
    }
    else {

        // Retira o overlay
        $('.overlay').hide();

        if (cameraAtiva == 0) {
            cameraPerspectiva.lookAt(scene.position);
            renderer.render(scene, cameraPerspectiva);
        }
        else {
            renderer.render(scene, cameraPokeball);
        }
    }
}


// =======================================================
// INTERAÇÃO COM O USUÁRIO
// =======================================================

function onWindowResize() {

    cameraPerspectiva.aspect = window.innerWidth / window.innerHeight;
    cameraPerspectiva.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

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
            cameraPokeball.position.z = pokeball3D.position.z-2;
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
            cameraPokeball.position.z = pokeball3D.position.z-2;
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


/**
 * Retorna uma posição (número) aleatória
 * @returns int
 */
function posicaoAleatoria(){
    var pos = Math.floor(Math.random() * 9);
    pos *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    return pos;
}

/**
 * Cria os controles na GUI tanto para a posição da luz, quanto do alvo da luz
 * @param {GUI} gui
 * @param {Vector3} vector3
 * @param {String} name
 * @param {function} onChangeFn
 */
function criarGUILuz(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -200, 20).onChange(onChangeFn);
    folder.add(vector3, 'y', 3, 20).onChange(onChangeFn);
    folder.add(vector3, 'z', -20, 20).onChange(onChangeFn);
    folder.open();
}

/**
 * Atualiza a luz e o helper
 */
function updateLight() {
    light.target.updateMatrixWorld();
    lightHelper.update();
}
  