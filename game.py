import pygame
import random
import math
from pathlib import Path

# --- הגדרות בסיסיות ---
BASE_WIDTH = 1280
BASE_HEIGHT = 720
FPS = 60

scale = 1.0
offset_x = 0
offset_y = 0
is_fullscreen = False
screen = None
game_surface = None

# פאלת צבעי ניאון (Cyberpunk Theme)
COLOR_BG = (10, 10, 18)          # סגול-שחור כהה מאוד לרקע
COLOR_GRID = (25, 20, 45)        # קווי רשת סגולים עמוקים
COLOR_TEXT = (0, 255, 200)       # טקסט טורקיז זוהר (Cyan)
COLOR_GRAY = (60, 60, 75)        # אפור ניאון כבוי לתצוגה מקדימה

COLOR_BLUE = (0, 180, 255)       # כדור ניאון כחול
COLOR_BLUE_GLOW = (0, 100, 255)  
COLOR_RED = (255, 0, 100)        # פצצת ניאון ורוד-אדום
COLOR_RED_GLOW = (180, 0, 50)
COLOR_GREEN = (50, 255, 100)     # ירוק זוהר לתוצאה חיובית

SAFE_ZONE_BORDER = 25
BOMB_FUSE_SECONDS = 5
MUSIC_FILE = Path(__file__).parent / "background music.mp3"

pygame.init()
pygame.display.set_caption("Cyberpunk Timing")
clock = pygame.time.Clock()

font_small = pygame.font.SysFont("Courier New", 26, bold=True)
font_med = pygame.font.SysFont("Courier New", 45, bold=True)
font_large = pygame.font.SysFont("Courier New", 85, bold=True)

HOW_TO_LINES = [
    "HOW TO PLAY",
    "",
    "LEFT CLICK  — hit blue balls",
    "RIGHT CLICK — defuse red bombs",
    "Red bombs explode after 5 seconds!",
    "Build COMBO with correct hits in a row",
    "Combo points: 1, 2, 3, 4...",
    "Miss or wrong button: -1, combo resets",
    "Click the core — the outer ring ignores clicks",
    "60 seconds — beat your high score",
    "F11 — toggle fullscreen",
]

high_score = 0
stars = []


def get_window_size():
    info = pygame.display.Info()
    max_w = int(info.current_w * 0.85)
    max_h = int(info.current_h * 0.85)
    width = min(BASE_WIDTH, max_w)
    height = int(width * BASE_HEIGHT / BASE_WIDTH)
    if height > max_h:
        height = max_h
        width = int(height * BASE_WIDTH / BASE_HEIGHT)
    return width, height


def update_layout():
    global scale, offset_x, offset_y
    sw, sh = screen.get_size()
    scale = min(sw / BASE_WIDTH, sh / BASE_HEIGHT)
    offset_x = (sw - int(BASE_WIDTH * scale)) // 2
    offset_y = (sh - int(BASE_HEIGHT * scale)) // 2


def toggle_fullscreen():
    global screen, is_fullscreen
    is_fullscreen = not is_fullscreen
    if is_fullscreen:
        info = pygame.display.Info()
        screen = pygame.display.set_mode((info.current_w, info.current_h), pygame.FULLSCREEN)
    else:
        screen = pygame.display.set_mode(get_window_size(), pygame.RESIZABLE)
    update_layout()


def handle_display_event(event):
    global screen
    if event.type == pygame.VIDEORESIZE and not is_fullscreen:
        screen = pygame.display.set_mode(event.size, pygame.RESIZABLE)
        update_layout()
    elif event.type == pygame.KEYDOWN and event.key == pygame.K_F11:
        toggle_fullscreen()


def start_background_music():
    if not MUSIC_FILE.exists():
        return

    pygame.mixer.init()
    pygame.mixer.music.load(str(MUSIC_FILE))
    pygame.mixer.music.set_volume(0.4)
    pygame.mixer.music.play(-1)


def setup_display():
    global screen, game_surface, stars

    game_surface = pygame.Surface((BASE_WIDTH, BASE_HEIGHT))
    screen = pygame.display.set_mode(get_window_size(), pygame.RESIZABLE)
    stars = [
        (random.randint(0, BASE_WIDTH), random.randint(0, BASE_HEIGHT), random.uniform(0.5, 2.0))
        for _ in range(40)
    ]
    update_layout()


def to_game_pos(pos):
    return ((pos[0] - offset_x) / scale, (pos[1] - offset_y) / scale)


def present():
    scaled = pygame.transform.smoothscale(
        game_surface, (int(BASE_WIDTH * scale), int(BASE_HEIGHT * scale))
    )
    screen.fill(COLOR_BG)
    screen.blit(scaled, (offset_x, offset_y))
    pygame.display.flip()

# --- פונקציית עזר לציור הרקע המעוצב ---
def draw_background(surface):
    surface.fill(COLOR_BG)
    
    # 1. ציור רשת סייברפונק (Grid Effect)
    grid_size = 50
    for x in range(0, BASE_WIDTH, grid_size):
        pygame.draw.line(surface, COLOR_GRID, (x, 0), (x, BASE_HEIGHT), 1)
    for y in range(0, BASE_HEIGHT, grid_size):
        pygame.draw.line(surface, COLOR_GRID, (0, y), (BASE_WIDTH, y), 1)
        
    # 2. ציור כוכבים מנצנצים ברקע
    for star in stars:
        x, y, speed = star
        # יצירת אפקט נצנוץ לפי הזמן הנוכחי
        alpha = int(155 + 100 * math.sin(pygame.time.get_ticks() * 0.005 * speed))
        star_color = (alpha, alpha, min(255, alpha + 30))
        pygame.draw.circle(surface, star_color, (x, y), 1)

# --- מחלקת אפקט הטקסט הצף ---
class FloatingText:
    def __init__(self, text, x, y, color, value):
        self.text = text
        self.x = x
        self.y = y
        self.color = color
        self.value = value
        self.speed = 5
        self.is_done = False
        self.target_x = 40
        self.target_y = 30

    def update(self):
        dir_x = self.target_x - self.x
        dir_y = self.target_y - self.y
        dist = math.hypot(dir_x, dir_y)
        
        if dist > 15:
            self.x += (dir_x / dist) * self.speed
            self.y += (dir_y / dist) * self.speed
            self.speed += 0.25
        else:
            self.is_done = True

    def draw(self, surface):
        rendered = font_small.render(self.text, True, self.color)
        surface.blit(rendered, (int(self.x), int(self.y)))

# --- מחלקת האובייקט שנזרק בקשת ---
class FlippedTarget:
    def __init__(self, x, y, radius, color):
        self.x = x
        self.y = y
        self.radius = radius
        self.color = color
        direction = 1 if random.random() < 0.5 else -1
        self.vel_x = direction * random.uniform(4, 8)
        self.vel_y = random.uniform(-14, -20)
        self.gravity = 0.7
        self.is_off_screen = False

    def update(self):
        self.x += self.vel_x
        self.vel_y += self.gravity
        self.y += self.vel_y
        if self.y > BASE_HEIGHT + 50:
            self.is_off_screen = True

    def draw(self, surface):
        # אפקט זוהר עדין גם לכדור העף
        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), self.radius + 4, 2)
        pygame.draw.circle(surface, (255, 255, 255), (int(self.x), int(self.y)), self.radius - 2)

# --- מחלקת הכדור / פצצה עם עיצוב ניאון ---
class Target:
    def __init__(self):
        self.type = "BOMB" if random.random() < 0.10 else "BALL"
        self.radius = random.randint(25, 35)
        self.is_active = False
        
        self.x = random.randint(100, BASE_WIDTH - 100)
        self.y = random.randint(120, BASE_HEIGHT - 100)
        
        self.pulse_angle = random.uniform(0, 360)
        self.activated_at = 0

    def draw(self, surface):
        current_radius = self.radius
        
        if not self.is_active:
            # עיצוב אפור כבוי של תצוגה מקדימה
            pygame.draw.circle(surface, (35, 35, 45), (self.x, self.y), current_radius)
            pygame.draw.circle(surface, COLOR_GRAY, (self.x, self.y), current_radius, 2)
        else:
            # הגדרת צבעים לפי סוג
            if self.type == "BALL":
                main_color = COLOR_BLUE
                glow_color = COLOR_BLUE_GLOW
            else:
                main_color = COLOR_RED
                glow_color = COLOR_RED_GLOW
                self.pulse_angle += 0.1
                fuse_left = self.bomb_seconds_left()
                urgency = 1 - fuse_left / BOMB_FUSE_SECONDS
                current_radius += int((4 + 6 * urgency) * math.sin(self.pulse_angle))

            # 1. ציור אזור הביטחון כטבעת טרון דקה
            pygame.draw.circle(surface, (40, 35, 65), (self.x, self.y), current_radius + SAFE_ZONE_BORDER, 1)
            
            # 2. אפקט זוהר (Glow Rings) - ציור עיגולים בשקיפות/עובי משתנה
            pygame.draw.circle(surface, glow_color, (self.x, self.y), current_radius + 6, 2)
            pygame.draw.circle(surface, glow_color, (self.x, self.y), current_radius + 3, 3)
            
            # 3. הליבה המרכזית (לבן/בהיר באמצע בשביל תחושת תלת מימד וזוהר)
            pygame.draw.circle(surface, main_color, (self.x, self.y), current_radius)
            pygame.draw.circle(surface, (255, 255, 255), (self.x, self.y), current_radius - 4, 2)
            pygame.draw.circle(surface, (255, 255, 255), (self.x, self.y), 3)

            if self.type == "BOMB":
                fuse_left = self.bomb_seconds_left()
                fuse_text = font_small.render(f"{math.ceil(fuse_left)}", True, COLOR_RED if fuse_left <= 2 else COLOR_TEXT)
                fuse_rect = fuse_text.get_rect(center=(self.x, self.y - current_radius - 18))
                surface.blit(fuse_text, fuse_rect)

    def activate(self):
        self.is_active = True
        if self.type == "BOMB":
            self.activated_at = pygame.time.get_ticks()

    def bomb_seconds_left(self):
        if self.type != "BOMB" or not self.is_active:
            return BOMB_FUSE_SECONDS
        elapsed = (pygame.time.get_ticks() - self.activated_at) / 1000
        return max(0, BOMB_FUSE_SECONDS - elapsed)

    def check_click(self, mouse_pos):
        distance = math.hypot(self.x - mouse_pos[0], self.y - mouse_pos[1])
        if distance <= self.radius + 4: # תוספת קטנה בגלל אפקט הפעימה
            return "HIT"
        elif distance <= (self.radius + SAFE_ZONE_BORDER):
            return "SAFE_ZONE"
        else:
            return "MISS"

# --- פונקציית משחק מרכזית ---
def run_game():
    global high_score
    
    current_target = Target()
    current_target.activate()
    next_target = Target()

    floating_texts = []
    flipped_targets = []
    score = 0
    combo = 0
    
    time_limit = 60
    start_ticks = pygame.time.get_ticks() 

    running = True
    while running:
        clock.tick(FPS)
        
        seconds_passed = (pygame.time.get_ticks() - start_ticks) / 1000
        time_left = max(0, int(time_limit - seconds_passed))
        
        if time_left <= 0:
            if score > high_score:
                high_score = score
            running = False

        if current_target.type == "BOMB" and current_target.bomb_seconds_left() <= 0:
            if score > high_score:
                high_score = score
            running = False

        # --- 1. קליטת קלטים ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                clicked_button = event.button
                mouse_pos = to_game_pos(event.pos)
                
                if clicked_button in (1, 3):
                    result = current_target.check_click(mouse_pos)
                    
                    if result == "HIT":
                        color = COLOR_BLUE if current_target.type == "BALL" else COLOR_RED
                        
                        is_correct = (current_target.type == "BALL" and clicked_button == 1) or \
                                     (current_target.type == "BOMB" and clicked_button == 3)
                        if is_correct:
                            combo += 1
                            points = combo
                            floating_texts.append(FloatingText(f"+{points}", current_target.x, current_target.y, COLOR_GREEN, points))
                        else:
                            combo = 0
                            floating_texts.append(FloatingText("-1", current_target.x, current_target.y, COLOR_RED, -1))
                        
                        flipped_targets.append(FlippedTarget(current_target.x, current_target.y, current_target.radius, color))
                        
                        current_target = next_target
                        current_target.activate()
                        next_target = Target()
                            
                    elif result == "MISS":
                        combo = 0
                        floating_texts.append(FloatingText("-1", mouse_pos[0], mouse_pos[1], COLOR_RED, -1))

            handle_display_event(event)

        # --- 2. עדכון אנימציות ---
        for ft in floating_texts[:]:
            ft.update()
            if ft.is_done:
                score += ft.value
                floating_texts.remove(ft)
                
        for pt in flipped_targets[:]:
            pt.update()
            if pt.is_off_screen:
                flipped_targets.remove(pt)

        # --- 3. ציור ---
        draw_background(game_surface)
        
        next_target.draw(game_surface)
        current_target.draw(game_surface)
        
        for pt in flipped_targets: pt.draw(game_surface)
        for ft in floating_texts: ft.draw(game_surface)
        
        score_text = font_med.render(f"SCORE: {score}", True, COLOR_TEXT)
        combo_text = font_med.render(f"COMBO: x{combo}", True, COLOR_GREEN if combo >= 3 else COLOR_TEXT)
        time_text = font_med.render(f"TIME: {time_left}s", True, COLOR_RED if time_left <= 10 else COLOR_TEXT)
        
        game_surface.blit(score_text, (20, 20))
        game_surface.blit(combo_text, ((BASE_WIDTH - combo_text.get_width()) // 2, 20))
        game_surface.blit(time_text, (BASE_WIDTH - time_text.get_width() - 20, 20))
        
        present()

BUTTON_HEIGHT = 60
BUTTON_PADDING = 48


def button_rect(label, y):
    text = font_med.render(label, True, COLOR_BG)
    width = text.get_width() + BUTTON_PADDING * 2
    return pygame.Rect((BASE_WIDTH - width) // 2, y, width, BUTTON_HEIGHT)


def draw_neon_button(surface, rect, label, hovered, text_color=COLOR_BG):
    fill_color = (0, 255, 150) if hovered else (0, 180, 120)
    pygame.draw.rect(surface, fill_color, rect, border_radius=8)
    pygame.draw.rect(surface, COLOR_TEXT, rect, 2, border_radius=8)
    text = font_med.render(label, True, text_color)
    surface.blit(text, (
        rect.x + (rect.width - text.get_width()) // 2,
        rect.y + (rect.height - text.get_height()) // 2,
    ))


def show_how_to_play():
    back_rect = button_rect("BACK", 620)

    while True:
        clock.tick(FPS)
        mouse_pos = to_game_pos(pygame.mouse.get_pos())

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1 and back_rect.collidepoint(to_game_pos(event.pos)):
                    return
            else:
                handle_display_event(event)

        draw_background(game_surface)

        y = 70
        for i, line in enumerate(HOW_TO_LINES):
            if not line:
                y += 14
                continue
            color = COLOR_BLUE if i == 0 else COLOR_TEXT
            font = font_med if i == 0 else font_small
            text = font.render(line, True, color)
            game_surface.blit(text, ((BASE_WIDTH - text.get_width()) // 2, y))
            y += 48 if i == 0 else 36

        draw_neon_button(game_surface, back_rect, "BACK", back_rect.collidepoint(mouse_pos))
        present()


# --- פונקציית מסך הבית ---
def main_menu():
    start_rect = button_rect("START", 400)
    how_rect = button_rect("HOW TO PLAY", 480)

    while True:
        clock.tick(FPS)
        mouse_pos = to_game_pos(pygame.mouse.get_pos())
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                pos = to_game_pos(event.pos)
                if event.button == 1 and start_rect.collidepoint(pos):
                    run_game()
                elif event.button == 1 and how_rect.collidepoint(pos):
                    show_how_to_play()
            else:
                handle_display_event(event)

        draw_background(game_surface)

        title_text = font_large.render("CYBERPUNK TIMING", True, COLOR_BLUE)
        high_score_text = font_med.render(f"HIGH SCORE: {high_score}", True, COLOR_TEXT)

        game_surface.blit(title_text, ((BASE_WIDTH - title_text.get_width()) // 2, 140))
        game_surface.blit(high_score_text, ((BASE_WIDTH - high_score_text.get_width()) // 2, 280))

        draw_neon_button(game_surface, start_rect, "START", start_rect.collidepoint(mouse_pos))
        draw_neon_button(game_surface, how_rect, "HOW TO PLAY", how_rect.collidepoint(mouse_pos))

        present()

setup_display()
start_background_music()
main_menu()
