import pygame
import os
import random
import sys
import neat
from neat.reporting import StdOutReporter
from neat.statistics import StatisticsReporter


def resource_dir():
    if getattr(sys, "frozen", False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


ASSETS_DIR = resource_dir()

pygame.init()

SCREEN_HEIGHT = 600
SCREEN_WIDTH = 1100
SCREEN = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))


def load_asset(filename):
    return pygame.image.load(os.path.join(ASSETS_DIR, filename))


RUNNING = [load_asset("DinoRun1.png"), load_asset("DinoRun2.png")]
JUMPING = load_asset("DinoJump.png")

SMALL_CACTUS = [
    load_asset("SmallCactus1.png"),
    load_asset("SmallCactus2.png"),
    load_asset("SmallCactus3.png"),
]
LARGE_CACTUS = [
    load_asset("LargeCactus1.png"),
    load_asset("LargeCactus1.png"),
    load_asset("LargeCactus3.png"),
]

BG = load_asset("Track.png")
_font_path = os.path.join(ASSETS_DIR, "freesansbold.ttf")
if os.path.isfile(_font_path):
    FONT = pygame.font.Font(_font_path, 20)
else:
    FONT = pygame.font.SysFont("arial", 20)

obstacles = []
dinosaurs = []
ge = []
nets = []
game_speed = 20
x_pos_bg = 0
y_pos_bg = 380
points = 0
pop = None


class Dinosaur:
    X_POS = 80
    Y_POS = 310
    JUMP_VEL = 8.5

    def __init__(self, img=RUNNING[0]):
        self.image = img
        self.dino_run = True
        self.dino_jump = False
        self.jump_vel = self.JUMP_VEL
        self.rect = pygame.Rect(self.X_POS, self.Y_POS, img.get_width(), img.get_height())
        self.color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        self.step_index = 0

    def update(self):
        if self.dino_jump:
            self.jump()
        elif self.dino_run:
            self.run()
        if self.step_index >= 10:
            self.step_index = 0

    def jump(self):
        self.image = JUMPING
        if self.dino_jump:
            self.rect.y -= self.jump_vel * 4
            self.jump_vel -= 0.8
        if self.jump_vel <= -self.JUMP_VEL:
            self.dino_jump = False
            self.dino_run = True
            self.jump_vel = self.JUMP_VEL
            self.rect.y = self.Y_POS

    def on_ground(self):
        return self.rect.y >= self.Y_POS

    def run(self):
        self.image = RUNNING[self.step_index // 5]
        self.rect.x = self.X_POS
        self.rect.y = self.Y_POS
        self.step_index += 1

    def draw(self, screen):
        screen.blit(self.image, (self.rect.x, self.rect.y))
        pygame.draw.rect(screen, self.color, self.rect, 2)
        for obstacle in obstacles:
            pygame.draw.line(
                screen,
                self.color,
                (self.rect.x + 54, self.rect.y + 12),
                obstacle.rect.center,
                2,
            )


class Obstacle:
    def __init__(self, image, number_of_cacti):
        self.image = image
        self.type = number_of_cacti
        self.rect = self.image[self.type].get_rect()
        self.rect.x = SCREEN_WIDTH

    def update(self):
        self.rect.x -= game_speed
        if self.rect.x < -self.rect.width:
            obstacles.pop()

    def draw(self, screen):
        screen.blit(self.image[self.type], self.rect)


class SmallCactus(Obstacle):
    def __init__(self, image, number_of_cacti):
        super().__init__(image, number_of_cacti)
        self.rect.y = 325


class LargeCactus(Obstacle):
    def __init__(self, image, number_of_cacti):
        super().__init__(image, number_of_cacti)
        self.rect.y = 300


def remove(index):
    dinosaurs.pop(index)
    ge.pop(index)
    nets.pop(index)


def is_illegal_airborne(dinosaur):
    if dinosaur.dino_jump:
        return False
    return dinosaur.rect.y < Dinosaur.Y_POS


def nearest_obstacle(dinosaur):
    if not obstacles:
        return None
    ahead = [o for o in obstacles if o.rect.right > dinosaur.rect.x]
    pool = ahead if ahead else obstacles
    return min(pool, key=lambda o: o.rect.left - dinosaur.rect.x)


def ai_inputs(dinosaur, obstacle):
    if obstacle is None:
        return (dinosaur.rect.y / SCREEN_HEIGHT, 1.0)
    gap = obstacle.rect.left - dinosaur.rect.x
    return (dinosaur.rect.y / SCREEN_HEIGHT, gap / SCREEN_WIDTH)


def eval_genomes(genomes, config):
    global game_speed, x_pos_bg, y_pos_bg, obstacles, dinosaurs, ge, nets, points
    clock = pygame.time.Clock()
    points = 0
    obstacles = []
    dinosaurs = []
    ge = []
    nets = []
    x_pos_bg = 0
    y_pos_bg = 380
    game_speed = 20

    for genome_id, genome in genomes:
        dinosaurs.append(Dinosaur())
        ge.append(genome)
        nets.append(neat.nn.FeedForwardNetwork.create(genome, config))
        genome.fitness = 0

    def score():
        global points, game_speed
        points += 1
        if points % 100 == 0:
            game_speed += 1
        text = FONT.render(f"Points:  {points}", True, (0, 0, 0))
        SCREEN.blit(text, (950, 50))

    def statistics():
        text_1 = FONT.render(f"Dinosaurs Alive:  {len(dinosaurs)}", True, (0, 0, 0))
        text_2 = FONT.render(f"Generation:  {pop.generation + 1}", True, (0, 0, 0))
        text_3 = FONT.render(f"Game Speed:  {game_speed:.1f}", True, (0, 0, 0))
        SCREEN.blit(text_1, (50, 450))
        SCREEN.blit(text_2, (50, 480))
        SCREEN.blit(text_3, (50, 510))

    def background():
        global x_pos_bg
        image_width = BG.get_width()
        SCREEN.blit(BG, (x_pos_bg, y_pos_bg))
        SCREEN.blit(BG, (image_width + x_pos_bg, y_pos_bg))
        if x_pos_bg <= -image_width:
            x_pos_bg = 0
        x_pos_bg -= game_speed

    run = True
    while run:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        SCREEN.fill((255, 255, 255))

        for dinosaur in dinosaurs:
            dinosaur.update()
            dinosaur.draw(SCREEN)

        if len(dinosaurs) == 0:
            break

        if len(obstacles) == 0:
            if random.randint(0, 1) == 0:
                obstacles.append(SmallCactus(SMALL_CACTUS, random.randint(0, 2)))
            else:
                obstacles.append(LargeCactus(LARGE_CACTUS, random.randint(0, 2)))

        for obstacle in obstacles:
            obstacle.draw(SCREEN)
            obstacle.update()

        for i in range(len(dinosaurs) - 1, -1, -1):
            dinosaur = dinosaurs[i]
            if is_illegal_airborne(dinosaur):
                remove(i)
                continue
            for obstacle in obstacles:
                if dinosaur.rect.colliderect(obstacle.rect):
                    remove(i)
                    break

        for i, dinosaur in enumerate(dinosaurs):
            ge[i].fitness += 1
            output = nets[i].activate(ai_inputs(dinosaur, nearest_obstacle(dinosaur)))
            if output[0] > 0.5 and not dinosaur.dino_jump and dinosaur.on_ground():
                dinosaur.dino_jump = True
                dinosaur.dino_run = False

        statistics()
        score()
        background()
        clock.tick(30)
        pygame.display.update()


def run(config_path):
    global pop
    config = neat.config.Config(
        neat.DefaultGenome,
        neat.DefaultReproduction,
        neat.DefaultSpeciesSet,
        neat.DefaultStagnation,
        config_path,
    )
    pop = neat.Population(config)
    pop.add_reporter(StdOutReporter(True))
    pop.add_reporter(StatisticsReporter())
    winner = pop.run(eval_genomes, 50)
    print(f"Best fitness: {winner.fitness}")


if __name__ == "__main__":
    config_path = os.path.join(resource_dir(), "config.txt")
    run(config_path)
