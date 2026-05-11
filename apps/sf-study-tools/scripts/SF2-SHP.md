Problem 1: The Galactic Explorer's Map
Concepts Covered: Object-Oriented Programming (classes, inheritance, polymorphism, iterators), Recursion, Stacks ADT

Scenario: You are a programmer for a space exploration company. The company has discovered a new galaxy with several planets, each with unique characteristics. You need to design a system to represent the galaxy, planets, and their relationships. Additionally, the exploration team needs a way to navigate through the galaxy using a stack-based pathfinding system.

Here is a list of tasks you'll need to complete:
1. Galaxy and Planet Classes:
   - Define a base class CelestialBody with attributes name and position (x, y coordinates).
   - Create subclasses Star and Planet that inherit from CelestialBody. Star should have an attribute temperature, and Planet should have attributes gravity and moons (a list of moon names).
   - Implement a method describe() in each class to print a description of the celestial body.
   - Use polymorphism to call describe() on a list of celestial bodies.
2. Galaxy Class:
   - Define a class Galaxy that contains a list of CelestialBody objects.
   - Implement a method find_planet(name) that recursively searches for a planet by name in the galaxy (assuming planets can have moons, which are also celestial bodies).
   - Make Galaxy iterable so you can loop through its celestial bodies.
3. Navigation Stack:
   - Implement a NavigationStack class with methods: push(location), pop(), top(), is_empty(), __len__(), and __repr__(). pop() and top() should raise IndexError if the stack is empty.
   - Use this stack to simulate a pathfinding journey: start from a star, visit planets, and return to the star.
*
**Solution**:
```python
from collections.abc import Iterable

class CelestialBody:
    def __init__(self, name, position):
        self.name = name
        self.position = position

    def describe(self):
        return f"{self.name} at position {self.position}"

class Star(CelestialBody):
    def __init__(self, name, position, temperature):
        super().__init__(name, position)
        self.temperature = temperature

    def describe(self):
        return f"{super().describe()}, a star with temperature {self.temperature}K"

class Planet(CelestialBody):
    def __init__(self, name, position, gravity, moons):
        super().__init__(name, position)
        self.gravity = gravity
        self.moons = moons

    def describe(self):
        moons_str = ", ".join(self.moons) if self.moons else "no moons"
        return f"{super().describe()}, a planet with gravity {self.gravity}m/s² and moons: {moons_str}"

class Galaxy:
    def __init__(self, name, bodies):
        self.name = name
        self.bodies = bodies

    def find_planet(self, name, current=None):
        if current is None:
            current = self.bodies
        for body in current:
            if isinstance(body, Planet) and body.name == name:
                return body
            if hasattr(body, 'moons'):
                result = self.find_planet(name, body.moons)
                if result:
                    return result
        return None

    def __iter__(self):
        return iter(self.bodies)

class NavigationStack:
    def __init__(self):
        self.stack = []

    def push(self, location):
        self.stack.append(location)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.stack.pop()

    def top(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.stack[-1]

    def is_empty(self):
        return len(self.stack) == 0

    def __len__(self):
        return len(self.stack)

    def __repr__(self):
        return f"NavigationStack({self.stack})"

# Example Usage
star = Star("Sun", (0, 0), 5500)
planet1 = Planet("Earth", (1, 1), 9.8, ["Moon"])
planet2 = Planet("Mars", (2, 2), 3.7, [])
galaxy = Galaxy("Milky Way", [star, planet1, planet2])
nav_stack = NavigationStack()
nav_stack.push("Sun")
nav_stack.push("Earth")
nav_stack.push("Mars")
print(nav_stack)  # NavigationStack(['Sun', 'Earth', 'Mars'])
while not nav_stack.is_empty():
    print(f"Visiting: {nav_stack.pop()}")
for body in galaxy:
    print(body.describe())
found = galaxy.find_planet("Earth")
print(found.describe() if found else "Not found")
```

#### Problem 2: The Election Data Analyzer
**Concepts Covered**: Data Science Libraries (Pandas, Matplotlib), List Comprehensions, Dictionaries, Exceptions

**Scenario**: You are working for a political consulting firm. You have been given a CSV file containing election results from various districts. Your task is to analyze the data, handle errors, and visualize the results.

**Tasks**:
1. Load the CSV file `election_results.csv` using Pandas. The file has columns: `district`, `candidate`, `votes`.
2. Use list comprehensions to create a list of total votes for each candidate across all districts.
3. Create a dictionary where keys are candidates and values are lists of districts they won (i.e., where they received the most votes).
4. Handle potential errors:
   - If the file does not exist, raise `FileNotFoundError`.
   - If the file is malformed (e.g., missing columns), raise a custom exception `InvalidDataError`.

**Solution**:
```python
import pandas as pd

class InvalidDataError(Exception):
    pass

def analyze_election_data(filename):
    try:
        df = pd.read_csv(filename)
        if not all(col in df.columns for col in ['district', 'candidate', 'votes']):
            raise InvalidDataError("Missing required columns")
    except FileNotFoundError:
        raise FileNotFoundError(f"File {filename} not found")
    except pd.errors.ParserError:
        raise InvalidDataError("Invalid data format in CSV")

    candidates = df['candidate'].unique()
    total_votes = [df[df['candidate'] == candidate]['votes'].sum() for candidate in candidates]
    
    winners = {}
    for district, group in df.groupby('district'):
        max_votes = group['votes'].max()
        winner = group[group['votes'] == max_votes]['candidate'].iloc[0]
        if winner not in winners:
            winners[winner] = []
        winners[winner].append(district)
    
    return total_votes, winners

# Example Usage
# Assuming election_results.csv exists
try:
    votes, winners = analyze_election_data('election_results.csv')
    print("Total Votes:", votes)
    print("Winners:", winners)
except (FileNotFoundError, InvalidDataError) as e:
    print(f"Error: {e}")
```

#### Problem 3: Broken Weather Stations
**Concepts Covered**: 2D Lists, Nested Loops, Tuples, List Comprehensions, Filter, Sets, Exceptions

**Scenario**: You are a climate scientist analyzing temperature data from a grid of weather stations. The data is represented as a 2D list, where each cell contains a temperature (float) or `None` (missing data). Your task is to perform various analyses on this grid.

**Tasks**:
1. Write a function to find the maximum temperature in the grid, ignoring `None` values.
2. Compute the average temperature of the grid, ignoring `None`.
3. Use list comprehension to create a new grid where each temperature is increased by 2°C (leave `None` as `None`).
4. Find all local maxima (cells greater than their four neighbors) and return their positions as tuples (row, col). A cell must be non-`None`, and all its neighbors must also be non-`None` to be considered.
5. Use `filter` to create a list of all temperatures above the average (excluding `None`).
6. Use a set to store all unique temperature values in the grid.

**Solution**:
```python
def max_temperature(grid):
    if not grid or not grid[0]:
        raise ValueError("Grid is empty")
    flat = [temp for row in grid for temp in row if temp is not None]
    return max(flat) if flat else None

def average_temperature(grid):
    if not grid or not grid[0]:
        raise ValueError("Grid is empty")
    flat = [temp for row in grid for temp in row if temp is not None]
    return sum(flat) / len(flat) if flat else None

def increase_temperatures(grid, delta=2):
    return [[temp + delta if temp is not None else None for temp in row] for row in grid]

def local_maxima(grid):
    maxima = []
    rows, cols = len(grid), len(grid[0])
    for i in range(1, rows-1):
        for j in range(1, cols-1):
            current = grid[i][j]
            if current is None:
                continue
            neighbors = [grid[i-1][j], grid[i+1][j], grid[i][j-1], grid[i][j+1]]
            if all(neighbor is not None for neighbor in neighbors) and all(current > neighbor for neighbor in neighbors):
                maxima.append((i, j))
    return maxima

def above_average(grid):
    avg = average_temperature(grid)
    flat = [temp for row in grid for temp in row if temp is not None]
    return list(filter(lambda x: x > avg, flat))

def unique_temperatures(grid):
    flat = [temp for row in grid for temp in row if temp is not None]
    return set(flat)

# Example Usage
grid = [
    [None, 20.0, 22.0, 21.0],
    [19.0, 23.0, 24.0, 20.0],
    [18.0, 21.0, 19.0, None]
]
print("Max Temp:", max_temperature(grid))
print("Avg Temp:", average_temperature(grid))
print("Increased Grid:", increase_temperatures(grid))
print("Local Maxima:", local_maxima(grid))
print("Above Avg:", above_average(grid))
print("Unique Temps:", unique_temperatures(grid))
```

#### Problem 4: Python Is Just a Calculator
**Concepts Covered**: OOP (abstract classes, inheritance, polymorphism), Recursion, Exceptions

**Scenario**: You are building a calculator for a math tutoring app. The app needs to evaluate mathematical expressions with nested parentheses, such as "(2 + (3 * 4))". You must design a system to parse and evaluate these expressions.

**Tasks**:
1. **Expression Classes**:
   - Define an abstract base class `Expression` with an abstract method `evaluate()`.
   - Create a subclass `Number` that holds a float value and implements `evaluate()` to return that value.
   - Create a subclass `BinaryOperation` that holds left and right `Expression`s and an operator (+, -, *, /), and implements `evaluate()` to compute the result. Handle division by zero with `ValueError`.
2. **Parser Function**:
   - Implement a recursive function `parse_expression(s)` that takes a string and returns an `Expression` object. Assume the expression is fully parenthesized, e.g., "(2 + (3 * 4))".
   - Use recursion to handle nested parentheses.
3. **Usage**:
   - Parse and evaluate several expressions, including some with nested parentheses.
   - Handle invalid expressions (e.g., unmatched parentheses, invalid characters) by raising appropriate exceptions.

**Solution**:
```python
from abc import ABC, abstractmethod

class Expression(ABC):
    @abstractmethod
    def evaluate(self):
        pass

class Number(Expression):
    def __init__(self, value):
        self.value = value

    def evaluate(self):
        return self.value

class BinaryOperation(Expression):
    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right

    def evaluate(self):
        left_val = self.left.evaluate()
        right_val = self.right.evaluate()
        if self.operator == '+':
            return left_val + right_val
        elif self.operator == '-':
            return left_val - right_val
        elif self.operator == '*':
            return left_val * right_val
        elif self.operator == '/':
            if right_val == 0:
                raise ValueError("Division by zero")
            return left_val / right_val
        else:
            raise ValueError("Invalid operator")

def parse_expression(s):
    s = s.strip()
    if s[0] == '(' and s[-1] == ')':
        s = s[1:-1].strip()
    if s.isdigit() or (s[0] == '-' and s[1:].isdigit()):
        return Number(float(s))
    else:
        for i, char in enumerate(s):
            if char in '+-*/':
                left = parse_expression(s[:i].strip())
                right = parse_expression(s[i+1:].strip())
                return BinaryOperation(left, char, right)
    raise ValueError("Invalid expression")

# Example Usage
try:
    expr = parse_expression("(2 + (3 * 4))")
    print(expr.evaluate())  # Output: 14.0
    expr = parse_expression("(10 / 0)")
    print(expr.evaluate())  # Raises ValueError
except ValueError as e:
    print(f"Error: {e}")
```