export interface Problem {
  id: number;
  title: string;
  description: string;
  defaultCode: string;
  testScript: (userCode: string) => string;
}

export const superHardProblems: Problem[] = [
  {
    id: 1,
    title: "Problem 1: Galactic Explorer's Map",
    description: `You are a programmer for a space exploration company. The company wants to map our galaxy with its several planets, each with unique characteristics. You need to design a system to represent the galaxy, planets, and their relationships. Additionally, the exploration team needs a way to navigate through the galaxy using a stack-based pathfinding system.

    <b>Here is a list of tasks you'll need to complete:</b>
    <b>1. Star and Planet Classes:</b>
     - Define a base class   <tt>CelestialBody</tt>   with attributes <tt>name</tt> and <tt>position</tt> (a tuple: (x:int, y:int)).
     - Create subclasses <tt>Star</tt> and <tt>Planet</tt> that inherit from <tt>CelestialBody</tt>. <tt>Star</tt> should have an attribute <tt>temperature</tt>, and <tt>Planet</tt> should have attributes <tt>gravity</tt> and <tt>moons</tt> (a list of moon names).
     - Implement a method <tt>describe()</tt> in each class to return a description of the celestial body: "<tt>NAME</tt> at position <tt>POSITION</tt>" 
     - Use polymorphism to call <tt>describe()</tt> on <tt>Star</tt> instances: "<tt>SUPER.DESCRIBE</tt>, a star with temperature <tt>TEMP</tt>K"
      - Use polymorphism to call <tt>describe()</tt> on <tt>Planet</tt> instances: "<tt>SUPER.DESCRIBE</tt>, a planet with gravity <tt>GRAVITY</tt>m/s^2 and moons: <tt>MOONS</tt>" (or "no moons" if the list is empty).
    <b>2. Galaxy Class:</b>
     - Define a class <tt>Galaxy</tt> (not a subclass) that contains a name and a list of <tt>CelestialBody</tt> objects.
     - Implement a method <tt>find_planet(name)</tt> that searches for a planet by name in the galaxy.
     - Make <tt>Galaxy</tt> iterable so you can loop through its celestial bodies.
    <b>3. Navigation Stack:</b>
     - Implement a <tt>NavigationStack</tt> class with methods: <tt>push(location)</tt>, <tt>pop()</tt>, <tt>top()</tt>, <tt>is_empty()</tt>, and <tt>len()</tt>. <tt>pop()</tt> and <tt>top()</tt> should raise <tt>IndexError</tt> if the stack is empty.
     - Use this stack to simulate a pathfinding journey: start from a star, visit planets, and return to the star.

     <b>4. Testing: Note that the tests are linear here. If a test does not work, it will affect all subsequent tests.</b>`,
    defaultCode: `# Only implement the classes and methods. No main code is needed.
class CelestialBody:
    pass
class Star:
    pass
class Planet:
    pass
class Galaxy:
    pass
class NavigationStack:
    pass`,
    testScript: (userCode) => `${userCode}
import json
results = []

try:
    star = Star("Sun", (0, 0), 5500)
    star_test = star.describe()
    results.append({"test":"StarSun","input": "star = Star('Sun', (0, 0), 5500)","expected":"Sun at position (0, 0), a star with temperature 5500K","got":star_test,"pass":star_test=="Sun at position (0, 0), a star with temperature 5500K","error":None})
except Exception as e:
    results.append({"test":"StarSun","input": "star = Star('Sun', (0, 0), 5500)","expected":"Sun at position (0, 0), a star with temperature 5500K","got":str(e),"pass":False,"error":str(e)})

try:
    planet1 = Planet("Earth", (1, 1), 9.8, ["Moon"])
    planet1_test = planet1.describe()
    results.append({"test":"PlanetEarth","input": "planet1 = Planet('Earth', (1, 1), 9.8, ['Moon'])","expected":"Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","got":planet1_test,"pass":planet1_test=="Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","error":None})
except Exception as e:
    results.append({"test":"PlanetEarth","input": "planet1 = Planet('Earth', (1, 1), 9.8, ['Moon'])","expected":"Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","got":str(e),"pass":False,"error":str(e)})

try:
    planet2 = Planet("Mars", (2, 2), 3.7, [])
    planet2_test = planet2.describe()
    results.append({"test":"PlanetMars","input": "planet2 = Planet('Mars', (2, 2), 3.7, [])","expected":"Mars at position (2, 2), a planet with gravity 3.7m/s^2 and moons: no moons","got":planet2_test,"pass":planet2_test=="Mars at position (2, 2), a planet with gravity 3.7m/s^2 and moons: no moons","error":None})
except Exception as e:
    results.append({"test":"PlanetMars","input": "planet2 = Planet('Mars', (2, 2), 3.7, [])","expected":"Mars at position (2, 2), a planet with gravity 3.7m/s^2 and moons: no moons","got":str(e),"pass":False,"error":str(e)})

try:
    planet3 = Planet("Jupiter", (3, 3), 24.8, ["Io", "Europa"])
    planet3_test = planet3.describe()
    results.append({"test":"PlanetJupiter","input": "planet3 = Planet('Jupiter', (3, 3), 24.8, ['Io', 'Europa'])","expected":"Jupiter at position (3, 3), a planet with gravity 24.8m/s^2 and moons: Io, Europa","got":planet3_test,"pass":planet3_test=="Jupiter at position (3, 3), a planet with gravity 24.8m/s^2 and moons: Io, Europa","error":None})
except Exception as e:
    results.append({"test":"PlanetJupiter","input": "planet3 = Planet('Jupiter', (3, 3), 24.8, ['Io', 'Europa'])","expected":"Jupiter at position (3, 3), a planet with gravity 24.8m/s^2 and moons: Io, Europa","got":str(e),"pass":False,"error":str(e)})

try :
    galaxy_test = [body.describe() for body in Galaxy("Milky Way", [star, planet1, planet2, planet3])]
    expected_bodies = ["Sun at position (0, 0), a star with temperature 5500K", "Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon", "Mars at position (2, 2), a planet with gravity 3.7m/s^2 and moons: no moons", "Jupiter at position (3, 3), a planet with gravity 24.8m/s^2 and moons: Io, Europa"]
    results.append({"test":"GalaxyIteration","input": "galaxy_test = [body.describe() for body in Galaxy('Milky Way', [star, planet1, planet2, planet3])]","expected":str(expected_bodies),"got":str(galaxy_test),"pass":galaxy_test==expected_bodies,"error":None})
except Exception as e:
    results.append({"test":"GalaxyIteration","input": "galaxy = Galaxy('Milky Way', [Star('Sun', (0, 0), 5500), Planet('Earth', (1, 1), 9.8, ['Moon']), Planet('Mars', (2, 2), 3.7, [])])","expected":"[list of descriptions]","got":str(e),"pass":False,"error":str(e)})

try:
    galaxy_empty = Galaxy("Empty", [])
    galaxy_empty_test = list(galaxy_empty)
    results.append({"test":"GalaxyEmpty","input": "galaxy_empty = Galaxy('Empty', [])","expected":"[]","got":str(galaxy_empty_test),"pass":galaxy_empty_test==[],"error":None})
except Exception as e:
    results.append({"test":"GalaxyEmpty","input": "galaxy_empty = Galaxy('Empty', [])","expected":"[]","got":str(e),"pass":False,"error":str(e)})

try:
    galaxy = Galaxy("Milky Way", [Star("Sun", (0, 0), 5500), Planet("Earth", (1, 1), 9.8, ["Moon"]), Planet("Mars", (2, 2), 3.7, [])])
    find_test = galaxy.find_planet("Earth")
    find_test_result = find_test.describe() if find_test else None
    results.append({"test":"FindPlanetEarth","input": "galaxy.find_planet('Earth')","expected":"Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","got":str(find_test_result),"pass":find_test_result=="Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","error":None})
except Exception as e:
    results.append({"test":"FindPlanetEarth","input": "galaxy.find_planet('Earth')","expected":"Earth at position (1, 1), a planet with gravity 9.8m/s^2 and moons: Moon","got":str(e),"pass":False,"error":str(e)})

try:
    nav = NavigationStack()
    nav.push("Sun")
    nav.push("Earth")
    nav.push("Mars")
    nav_multi_test = {"top": nav.top(), "len": len(nav)}
    results.append({"test":"PushThree","input": "nav.push('Sun'); nav.push('Earth'); nav.push('Mars')","expected":{"top":"Mars", "len":3},"got":nav_multi_test,"pass":nav_multi_test=={"top":"Mars", "len":3},"error":None})
    pops = []
    while not nav.is_empty():
        pops.append(nav.pop())
    results.append({"test":"PopAll","input": "while not nav.is_empty(): pops.append(nav.pop())","expected":["Mars", "Earth", "Sun"],"got":pops,"pass":pops==["Mars", "Earth", "Sun"],"error":None})
except Exception as e:
    results.append({"test":"PushPopAll","input": "nav.push('Sun'); nav.push('Earth'); nav.push('Mars'); pops","expected":"['Mars', 'Earth', 'Sun']","got":str(e),"pass":False,"error":str(e)})

try:
    nav_empty = NavigationStack()
    nav_empty_test = {"is_empty": nav_empty.is_empty(), "len": len(nav_empty)}
    results.append({"test":"EmptyStack","input": "nav = NavigationStack()","expected":{'is_empty':True, 'len':0},"got":nav_empty_test,"pass":nav_empty_test=={'is_empty':True, 'len':0},"error":None})
except Exception as e:
    results.append({"test":"EmptyStack","input": "nav = NavigationStack()","expected":{'is_empty':True, 'len':0},"got":str(e),"pass":False,"error":str(e)})

try:
    nav = NavigationStack()
    nav.top()
    results.append({"test":"TopEmpty","input": "nav.top()","expected":"IndexError","got":"No error","pass":False,"error":None})
except IndexError as e:
    results.append({"test":"TopEmpty","input": "nav.top()","expected":"IndexError","got":"IndexError","pass":True,"error":str(e)})

try:
    nav = NavigationStack()
    nav.pop()
    results.append({"test":"PopEmpty","input": "nav.pop()","expected":"IndexError","got":"No error","pass":False,"error":None})
except IndexError as e:
    results.append({"test":"PopEmpty","input": "nav.pop()","expected":"IndexError","got":"IndexError","pass":True,"error":str(e)})

json.dumps(results)
`,
  },
];
