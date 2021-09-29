const cheese = {X: 80, Y: 40};
class Mice {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.el = null;
        this.inheritedSteps = [];
        this.steps = [];
        this.fitness = 0;
    }

    moveTo(newX, newY) {
        this.posX = newX;
        this.posY = newY;
        // Faz a animação
        this.el.style.cssText = 
        'left: '+ this.posX +'%;'+
        'top: '+ this.posY +'%;';
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sumOfArray(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
}

function weighted_random(items, weights) {
    var i;

    for (i = 0; i < weights.length; i++)
        weights[i] += weights[i - 1] || 0;
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return items[i];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var app = new Vue({
    el: '#app',
    data: {
        vueCanvas: null,
        canvas: null,
        ctx: null,
        miceVet: [],
        miceQuant: 20,
        fitness: [],
        maxSteps: 100,
        genQuant: 10,
        obedience: 95, //95%
        mutationRate: 5, //5%
        entitiesPlane: null,
        pathMatrix: [[]],
        pathConstructor: [],
        pathImg: null,
        miceImg: null,
        usingShovel: false,
        drawing: false,
        radius: 30,
        heightDisparity: 0,
        widthDisparity: 0,
    },
    mounted: function () {
        var wrapper = document.querySelector(".canvas-wrapper");
        this.canvas = document.querySelector("#canvas");
        this.entitiesPlane = document.querySelector("#entities");
        this.ctx = canvas.getContext("2d");
        this.heightDisparity = (window.innerHeight - wrapper.clientHeight)/2;
        this.widthDisparity = (window.innerWidth - wrapper.clientWidth)/2;
        this.canvas.height = wrapper.clientHeight;
        this.canvas.width = wrapper.clientWidth;
        this.pathImg = new Image;
        this.miceImg = new Image;
        this.pathImg.onload = this.start;
        this.miceImg.onload = this.createMicePop;
        this.pathImg.src = './img/grass.jpg';
        this.miceImg.src = './img/mice.png';
    },
    methods: {
        useShovel() {
            this.usingShovel = !this.usingShovel;
        },
        startDrawing(e) {
            if (this.usingShovel) { // Start drawing only if shovel is active
                this.drawing = true;
                this.draw(e);
            }
        },
        draw(e) {
            if(!this.drawing) return // Only draw if passed through startDrawing() first

            this.ctx.beginPath();
            this.ctx.arc(e.clientX-this.widthDisparity, e.clientY-this.heightDisparity, this.radius, 0, Math.PI*2);
            this.pathConstructor.push({X: e.clientX-this.widthDisparity, Y: e.clientY-this.heightDisparity, radius: this.radius});
            this.ctx.fill();
            this.ctx.moveTo(e.clientX-this.widthDisparity, e.clientY-this.heightDisparity);
        },
        finishedDrawing() {
            this.drawing = false;
            this.ctx.closePath();
        },
        teste() {
            makeFirstGen();
        },
        start() {
            // Draw grass field
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(this.pathImg, 0, 0, this.canvas.width, this.canvas.height);

            // Draw holes for mice & cheese
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.arc((this.canvas.width*0.8)+50, (this.canvas.height*0.4)+50, this.radius*3, 0, Math.PI*2);
            this.ctx.arc((this.canvas.width*0.1)+16, (this.canvas.height*0.4)+50, this.radius*3, 0, Math.PI*2);
            this.pathConstructor.push({X: (this.canvas.width*0.8)+50, Y: (this.canvas.height*0.4)+50, radius: this.radius*3});
            this.pathConstructor.push({X: (this.canvas.width*0.1)+16, Y: (this.canvas.height*0.4)+50, radius: this.radius*3});
            this.ctx.fill();

            // This will erase where next drawing is drawn
            this.ctx.globalCompositeOperation = 'destination-out';
        },
        createMicePop() {
            // Criado os ratos
            for (let i = 0; i < this.miceQuant; i++) {
                let mice = new Mice(getRandomIntInclusive(7, 13), getRandomIntInclusive(40, 55));
                // Crio o elemento img
                mice.el = document.createElement("img");
                // Adiciono classe .mice e src da imagem
                mice.el.classList.add("mice");
                mice.el.src = "./img/mice.png";
                // Defino a posicao
                mice.el.style.cssText = 
                'left: '+ mice.posX +'%;'+
                'top: '+ mice.posY +'%;';
                // Mando pro DOM e pro vetor
                this.entitiesPlane.appendChild(mice.el);
                this.miceVet.push(mice);
            }
        },
        makeFirstGen() {
            // Gerando os genes de cada um e fazendo a animação deles
            for (let i = 0; i < this.miceQuant; i++) {
                this.miceVet[i].steps.push({X: this.miceVet[i].posX, Y: this.miceVet[i].posY});
                
                for (let j = 1; j < this.maxSteps; j++) {
                    let aux = this.generateRandomMicePath(this.miceVet[i]);
                    this.miceVet[i].steps.push(aux);
                }
                //console.log(this.miceVet[i].steps.length)
                let length = this.miceVet[i].steps.length;
                this.miceVet[i].moveTo(this.miceVet[i].steps[length-1].X, this.miceVet[i].steps[length-1].Y);
            }
            

            //this.generations();
        },
        async generations() {
            for (let i = 0; i < this.genQuant; i++) {
                console.log(i);
                if (i == 0) {
                    this.makeFirstGen(); // Generate primordial genes  
                } else {
                    // Fazer cada ratinho andar
                    for (let j = 0; j < this.miceQuant; j++) {
                        //console.log("oi")
                        for (let k = 0; k < this.miceVet[j].inheritedSteps.length; k++) {
                            if (getRandomIntInclusive(1, 100) <= this.obedience) { // Obedece o caminho herdado
                                this.miceVet[j].steps.push(this.miceVet[j].inheritedSteps[k].X, this.miceVet[j].inheritedSteps[k].Y)
                            } else {
                                this.miceVet[j].steps.push(this.generateRandomMicePath(this.miceVet[j]));
                            }
                        }
                        
                        let length = this.miceVet[j].steps.length;
                        for(let m=0; m<this.miceQuant; m++) {
                            console.log(this.miceVet[m].steps)
                        }
                        this.miceVet[j].moveTo(this.miceVet[j].steps[length-1].X, this.miceVet[j].steps[length-1].Y);
                    }
                }
                //console.log(this.miceVet)

                // Para cada ratinho faz o Fitness dele
                this.cleanFitness();
                for (let j = 0; j < this.miceQuant; j++) {
                    this.fitness.push(this.fitnessFunc(this.miceVet[j]));
                    this.miceVet[j].fitness = this.fitness[this.fitness.length-1];
                }

                // Para metade da população de ratinhos escolher dois pais, fazer crossover e criar dois filhos
                let children = [];
                for (let j = 0; j < this.miceQuant/2; j++) {
                    // De todos os ratos fazer a probabilidade de cada um deles de acordo com seu fitness e escolher 2 para serem os pais
                    let sumFitness = sumOfArray(this.fitness);
                    let weights = this.fitness.map(function (val) {
                        return val/sumFitness;
                    });
                    let parent1, parent2 = null;
                    while(parent1 == parent2) { // Acho que se encaixa como uma escolha por roleta
                        // Tipo um sample() do R
                        parent1 = weighted_random(this.miceVet, weights); // Retorna a posição do escolhido
                        parent2 = weighted_random(this.miceVet, weights);
                    }
                    //console.log(parent1, parent2)
                    // Crossover
                    let pointOfRupture = this.rupture(parent1, parent2);
                    if (pointOfRupture == null) { // Não possuem pontos em comum
                        // Levo ambos os pais para a próxima geração
                        // Elitismo
                        
                        parent1.inheritedSteps.concat(parent1.steps);
                        parent1.steps = [];
                        parent2.inheritedSteps.concat(parent2.steps);
                        parent2.steps = [];
                        children.push(parent1);
                        children.push(parent2);
                        
                    } else { // Crio dois filhos
                        pointOfParent1 = parent1.steps.findIndex(function (val) {
                            return ((pointOfRupture.X == val.X) && (pointOfRupture.Y == val.Y));
                        });
                        pointOfParent2 = parent2.steps.findIndex(function (val) {
                            return ((pointOfRupture.X == val.X) && (pointOfRupture.Y == val.Y));
                        });
                        // Partindo e criando vetor de passos
                        let child1 = new Mice(parent1.steps[0].X, parent1.steps[0].Y);
                        child1.el = parent1.el
                        child1.inheritedSteps = child1.inheritedSteps.concat(parent1.steps.slice(0, pointOfParent1), parent2.steps.slice(pointOfParent2));
                        let child2 = new Mice(parent2.steps[0].X, parent2.steps[0].Y);
                        child2.el = parent2.el
                        child2.inheritedSteps = child2.inheritedSteps.concat(parent2.steps.slice(0, pointOfParent2), parent1.steps.slice(pointOfParent1));
                        children.push(child1);
                        children.push(child2);
                        //console.log(child1, child2)
                    }
                }
                this.miceVet = [];
                for (let index = 0; index < children.length; index++) {
                    this.miceVet.push(children[index]);
                }
                
                await sleep(1000);
            }
        },
        rupture(mice1, mice2) {
            // Encontrar coordenadas em comum entre os passos dos dois ratos
            //console.log(mice1, mice2)
            const filteredArray = mice1.steps.filter(value => mice2.steps.some(function (val) {
                return ((value.X == val.X) && (value.Y == val.Y));
            }));
            
            if (filteredArray && filteredArray.length > 0) {
                // Escolho um ponto aleatório
                return filteredArray[getRandomIntInclusive(0, filteredArray.length)];
            } else { // Não existe nenhum ponto em comum
                return null;
            }
        },
        generateRandomMicePath(mice) {
            var path = {X: mice.posX, Y: mice.posY};
            //console.log(path);
            // Escolhe um caminho aleatório válido dentro da PathMatrix
            do {
                let x = getRandomIntInclusive(-1, 1);
                let y = getRandomIntInclusive(-1, 1);
                //console.log(path);
                path = {
                    X: (path.X + x), 
                    Y: (path.Y + y)
                };
            } while ((path.X < 0 || path.X > 100) || (path.Y < 0 || path.Y > 100) || (this.isInPathMatrix(path.X, path.Y) != true));

            return path;
        },
        isInPathMatrix(x, y) {
            //console.log(x, y, this.pathMatrix[x][y]);
            if (this.pathMatrix[x][y] == 1) {
                return true;
            } else {
                return false;
            }
        },
        fitnessFunc(mice) {
            // Primeira tentativa de Fitness
            let lastStep = mice.steps[mice.steps.length-1];
            return Math.sqrt(Math.pow(cheese.X - lastStep.X, 2) + Math.pow(cheese.Y - lastStep.Y, 2)) // Distance
        },
        cleanFitness() {
            for (let i = 0; this.fitness.length > 0; i++) {
                this.fitness.pop();
            }
        },
        createPathMatrix() {
            this.pathMatrix = [[]];
            for (let i = 0; i < 100; i++) {
                let vet = [100];
                this.pathMatrix.push(vet);
                for (let j = 0; j < 100; j++) {
                    this.pathMatrix[i].push(0);
                }
            }
            this.ctx.beginPath();
            this.ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < this.pathConstructor.length; i++) {
                this.ctx.moveTo(this.pathConstructor[i].X, this.pathConstructor[i].Y);
                this.ctx.arc(this.pathConstructor[i].X, this.pathConstructor[i].Y, this.pathConstructor[i].radius, 0, Math.PI*2);
            }
            //this.ctx.fillStyle = "blue";
            //this.ctx.fill();
            for (let i = 0; i < this.pathMatrix.length; i++) {
                for (let j = 0; j < this.pathMatrix[i].length; j++) {
                    if (this.ctx.isPointInPath((this.canvas.width/100)*(i+1), (this.canvas.height/100)*(j+1))) {
                        this.pathMatrix[i][j] = 1;
                    } else {
                        this.pathMatrix[i][j] = 0;
                    }
                }
            }
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.closePath();
            //console.log(this.pathMatrix)

            this.generations();
        }
    }
})
