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
var hemiLight;
var light, lightHelper, shadowHelper;

// Canvas
var canvas = document.getElementById('modelo');

// Objetos
var ivysaur3D = new THREE.Object3D;
var bulbasaur3D = new THREE.Object3D;
var groudon3D = new THREE.Object3D;
var magnemite3D = new THREE.Object3D;
var pokeball3D = new THREE.Object3D;
var sun3D;
var sunGlow;

// Para uso do loader
var ivysaurCarregado = false;
var bulbasaurCarregado = false;
var groudonCarregado = false;
var magnemiteCarregado = false;
var pokeballCarregado = false;
var flagCarregado = 0;

var porcIvysaur = 0, porcBulba = 0, porcGroudon = 0, porcMagnemite = 0, porcPokeball = 0;
var porcentagem = 0;    // Média das porcentagens


// Animação
var clock = new THREE.Clock();
var mixer;
var action;

// Para as curvas
var curva;
var pontos;
var t = 0;  // Parâmetro do polinômio de Bernstein da Curva de Bézier (vai de 0 até 1)


// Chamadas
init();
animate();


// =======================================================
// FUNÇÕES
// =======================================================

// Função init
function init() {

    // =======================================================
    // Loader
    // =======================================================
    
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {

        console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    
    };
    
    loadingManager.onLoad = function ( ) {
    
        console.log( 'Loading complete!' );

        // Retira o overlay
        $('.overlay').hide();
    
    };
    
    loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    
        console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    
    };
    
    loadingManager.onError = function ( url ) {
    
        console.log( 'There was an error loading ' + url );
    
    };


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

    renderer.physicallyCorrectLights = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;

    container.appendChild(renderer.domElement);


    // =======================================================
    // Cena
    // =======================================================
    
    scene = new THREE.Scene();
    // scene.background = new THREE.Color('black');


    // =======================================================
    // Camera
    // =======================================================

    var ASPECT_RATIO = window.innerWidth / window.innerHeight;
    var viewSize = 1080;

    // Camera PERSPECTIVA
    cameraPerspectiva = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.01, 1000); //1000
    cameraPerspectiva.position.set(0,10,-20);   
    cameraPerspectiva.updateMatrixWorld();

    // Camera Pokeball
    cameraPokeball = new THREE.PerspectiveCamera(45, ASPECT_RATIO, 0.01, 1000); //1000
    cameraPokeball.position.set(0,1,-2);
    cameraPokeball.updateMatrixWorld();
    cameraPokeball.lookAt(0,.75,0);


    scene.add(cameraPerspectiva);
    scene.add(cameraPokeball);
    

    // =======================================================
    // Luzes
    // =======================================================

    // Luz de Hemisfério
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add(hemiLight);
    

    // ambient = new THREE.AmbientLight('white', 1.25);
    // scene.add(ambient);

    // Luz Direcional do Sol
    light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(101, 0, 0);
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
    lightHelper = new THREE.DirectionalLightHelper( light, 5, 'black');
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

    var texturaPlano = new THREE.TextureLoader(loadingManager).load('img/grass2.jpg');
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
    // Vertex e Fragment Shaders (Phong)
    // =======================================================

    var vertexShader = document.getElementById("vertex-shader");
    var fragmentShader = document.getElementById("fragment-shader");    
    
    var material = new THREE.ShaderMaterial({
        // Passa os parâmetros para os shaders
        uniforms: {
            Ka: { value: 1.0 },
            Kd: { value: 1.0 },
            Ks: { value: 1.0 },
            shininess: { value: 80 },
            ambientColor: { value: new THREE.Color(0x341900) },
            diffuseColor: { value: new THREE.Color(0xCC0000) },
            specularColor: { value: new THREE.Color(0xFFFFFF) },
            lightPosition: { value: light.position }
        },
        vertexShader: vertexShader.textContent,
        fragmentShader: fragmentShader.textContent
    });


    // =======================================================
    // Modelos
    // =======================================================

    // !REMOVER: Helper para os eixos 
    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    //? The X axis is red. The Y axis is green. The Z axis is blue.


    // Sol
    var solGeometry = new THREE.SphereGeometry( 1, 32, 32 );
    var materialSphere = new THREE.MeshBasicMaterial( {color: 0xFFCC33} );
    sun3D = new THREE.Mesh( solGeometry, materialSphere );
    sun3D.name = 'sol';
    sun3D.position.copy(light.position);
    scene.add( sun3D );

    var materialSol = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 1.0 },
            p: { value: 0.4 },
            glowColor: { value: new THREE.Color(0xFC9601) },
            viewVector: { value: cameraPerspectiva.position }
        },
        vertexShader: $('#vertex-shader-sol').text(),
        fragmentShader: $('#fragment-shader-sol').text(),
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    sunGlow = new THREE.Mesh(solGeometry.clone(), materialSol.clone());
    sunGlow.position.copy(sun3D.position);
    sunGlow.scale.multiplyScalar(1.2);
    scene.add(sunGlow);


    // Texturas
    var loader = new THREE.TextureLoader(loadingManager);

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
    var mtlIvysaur = new  THREE.MTLLoader(loadingManager);
    mtlIvysaur.setPath('assets/');
    mtlIvysaur.load('ivysaur/Pokemon.mtl', function(materials) {
        
        materials.preload();
        
        var objIvysaur = new THREE.OBJLoader(loadingManager);
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
            }
        );

    });


    // BULBASAUR
    var mtlBulbasaur = new  THREE.MTLLoader(loadingManager);
    mtlBulbasaur.setPath('assets/');
    mtlBulbasaur.load('bulbasaur/bulbasaur.mtl', function(materials) {
        
        materials.preload();
        
        var objBulbasaur = new THREE.OBJLoader(loadingManager);
        objBulbasaur.setMaterials(materials);
        objBulbasaur.setPath('assets/');
        objBulbasaur.load(
            
            // URL
            'bulbasaur/bulbasaur.obj', 
            
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
            }
        );

    });


    // GROUDON
    var objGroudon = new THREE.OBJLoader(loadingManager);
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
        }
    );


    // MAGNEMITE
    var mtlMagnemite = new  THREE.MTLLoader(loadingManager);
    mtlMagnemite.setPath('assets/');
    mtlMagnemite.load('magnemite/Magnemite.mtl', function(materials) {
        
        materials.preload();
        
        var objMagnemite = new THREE.OBJLoader(loadingManager);
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
            }
        );

    });
        

    // NOVA POKEBALL
    var fbxPokeball = new THREE.FBXLoader(loadingManager);
    fbxPokeball.setPath('assets/');
    fbxPokeball.load(

        // URL
        'pokeball/Pokeball2.fbx',

        function (object) {

            mixer = new THREE.AnimationMixer(object);

            action = mixer.clipAction(object.animations[0]);
            action.play();

            // Sombra
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            object.scale.set(0.0015, 0.0015, 0.0015);       // Escala

            pokeball3D = object;
            pokeball3D.name = 'pokeball';                   // Nome para futura referência
            pokeballCarregado = true;

            scene.add(object);

        }

    );
    

    // =======================================================
    // Curva de Bézier para a Pokebola
    // =======================================================

    curva = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -101, 0, 0 ),
        new THREE.Vector3( -101, 101, 0 ),
        new THREE.Vector3( 101, 101, 0 ),
        new THREE.Vector3( 101, 0, 0 )
    );
    
    pontos = curva.getPoints(50);
    
    // Linha da curva
    var g = new THREE.BufferGeometry().setFromPoints( pontos );
    var m = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var linhaCurva = new THREE.Line( g, m );
    scene.add(linhaCurva);
    


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

// Função animate (loop)
function animate(){
    requestAnimationFrame(animate);
    render();
}

// Funcão render
function render() {

    // Atualiza a posição da pokeball conforme a curva definida
    posicaoSol(60);

    // Aplica a animação na Pokeball
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

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

/**
 * Trata do redimensionamento da tela
 */
function onWindowResize() {

    cameraPerspectiva.aspect = window.innerWidth / window.innerHeight;
    cameraPerspectiva.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

/**
 * Trata dos eventos de clique no teclado
 */
function Teclado(e) {

    var incremento = 0.1;
    var novaPosicao;

    // Teclas: W A S D
    var tecla = String.fromCharCode(e.which);

    switch (tecla) {
        case 'A':    // A : esquerda
            pokeball3D.position.x += incremento;
            cameraPokeball.position.x = pokeball3D.position.x;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 'W':    // W : frente
            novaPosicao = pokeball3D.position.z + incremento;
            pokeball3D.position.z = novaPosicao;
            cameraPokeball.position.z = pokeball3D.position.z-2;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 'D':    // D : direita
            pokeball3D.position.x -= incremento;
            cameraPokeball.position.x = pokeball3D.position.x;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 'S':    // S : trás
            novaPosicao = pokeball3D.position.z - incremento;
            pokeball3D.position.z = novaPosicao;
            cameraPokeball.position.z = pokeball3D.position.z-2;
            cameraPokeball.lookAt(pokeball3D.position.x, .75, pokeball3D.position.z);
            break;

        case 'O':
            console.log('play');
            action.play();
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
 * Atualiza a luz e o helper (e o sol)
 */
function updateLight() {

    // Atualiza a posição do sol e do seu brilho
    sun3D.position.copy(light.position);
    sunGlow.position.copy(light.position);

    // Atualiza a posição de luz e do seu helper
    light.target.updateMatrixWorld();
    lightHelper.update();

}

/**
 * Atualiza a posição do sol conforme a Curva de Bézier
 */
function posicaoSol(tempo) {

    // Calcula o incremento de t para que o jogo demore 'tempo' segundos
    var inc = 1 / (60 * tempo);

    sol = scene.getObjectByName('sol');
    if (t <= 1) {

        // Atualiza a posição e incrementa o parâmetro
        sol.position.copy(curva.getPointAt(t));
        light.position.copy(sol.position);
        sunGlow.position.copy(sol.position);
        
        // Atualiza a posição de luz e do seu helper
        light.target.updateMatrixWorld();
        lightHelper.update();
        
        t += inc;

    }
    else
        // Chegou ao final. Volta à posição inicial
        t = 0;

}

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
    folder.add(vector3, 'x', -101, 101).onChange(onChangeFn);
    folder.add(vector3, 'y', 3, 20).onChange(onChangeFn);
    folder.add(vector3, 'z', -20, 20).onChange(onChangeFn);
    folder.open();
}