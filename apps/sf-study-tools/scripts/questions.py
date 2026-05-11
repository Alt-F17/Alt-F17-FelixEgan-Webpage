
def question_1():
    """
    What is the output of the snippet of code below after it is executed?

    lst = [[1,2,3],[4, "X", 6],[7,8,9]]
    data = {1: "A", 2: "B", 3: "C", 4: "D", 6: "F", 7: "G", 8: "H", 9: "I"}
    for row in lst:
        for i in range(len(row)):
            row[i] = data[row[i]]
    print(lst[1][1])

    A) It will print "X"
    B) It will print "B"
    C) This code produces a KeyError
    D) This code produces a ValueError
    """

def question_2():
    """
    Write a function ordered_teams that takes the dictionary standings given below as input and returns a 2D list with the sublist including the team name and the team's points accumulated throughout the season, in alphabetical order by team name. Note that each team's record in the dictionary given below is in the format [wins, regulation losses, overtime losses], and that a win is worth 2 points, an overtime loss is worth one, and a regulation loss is worth none.

    standings = {
        "Bruins": [28,28,8],
        "Canadiens": [30,26,6],
        "Penguins": [24,30,10],
        "Predators": [23,32,7],
        "Jets": [43,16,4],
        "Oilers": [36,22,4]
    }

    Which of the following is the correct output for ordered_teams(standings)?

    A) [['Bruins', 64], ['Canadiens', 66], ['Jets', 90], ['Oilers', 76], ['Penguins', 58], ['Predators', 53]]
    B) [['Bruins', 56], ['Canadiens', 60], ['Jets', 86], ['Oilers', 72], ['Penguins', 48], ['Predators', 46]]
    C) [['Bruins', 36], ['Canadiens', 36], ['Jets', 47], ['Oilers', 40], ['Penguins', 34], ['Predators', 30]]
    D) [['Bruins', 28], ['Canadiens', 30], ['Jets', 43], ['Oilers', 36], ['Penguins', 24], ['Predators', 23]]
    """

def question_3a():
    """
    A retail store collects monthly sales data (in thousands of dollars) for three different product categories: Electronics, Clothing, and Furniture. The data is provided in a Pandas DataFrame as shown below.

    | Months | Electronics | Clothing | Furniture |
    |--------|-------------|----------|-----------|
    | Jan    | 50          | 20       | 30        |
    | Feb    | 55          | 22       | 28        |
    | Mar    | 53          | 21       | 35        |
    | Apr    | 60          | 25       | 40        |
    | May    | 62          | 27       | 38        |
    | Jun    | 65          | 26       | 42        |

    What is the mean sales for Electronics over the six months?

    A) 55.83
    B) 56.0
    C) 57.0
    D) 58.0
    """

def question_3b():
    """
    Using the same sales data as above, which of the following correctly describes the line plot of sales over time for the three categories?

    A) Electronics sales increase steadily from Jan to Jun
    B) Clothing sales peak in April
    C) Furniture sales are highest in June
    D) All categories have the same sales in March
    """

def question_4():
    """
    Given the snippet of code below, what type of error does it produce?

    matrix = [[1,2,3],[4,5,6],[7,8,9]]
    for row in range(3):
        for col in range(3):
            print(matrix[row, col])

    A) SyntaxError
    B) TypeError
    C) IndexError
    D) ValueError
    """

def question_5():
    """
    Write a function countPeaks that accepts a 2D-matrix of integers. This function should count the number of integers within the matrix that are strictly greater than their neighbors and return the total number of peaks. A neighbor is an integer to the left, right, top or bottom of the currently indexed integer.

    Sample Input to countPeaks:
    [[10,2,5],
     [3,20,4],
     [31,2,14]]

    Sample Output:
    5

    Which of the following is the correct implementation of countPeaks?

    A) def countPeaks(matrix):
           peaks = 0
           for i in range(len(matrix)):
               for j in range(len(matrix[i])):
                   if matrix[i][j] > matrix[i-1][j] and matrix[i][j] > matrix[i+1][j] and matrix[i][j] > matrix[i][j-1] and matrix[i][j] > matrix[i][j+1]:
                       peaks += 1
           return peaks

    B) def countPeaks(matrix):
           peaks = 0
           for i in range(1, len(matrix)-1):
               for j in range(1, len(matrix[i])-1):
                   if matrix[i][j] > matrix[i-1][j] and matrix[i][j] > matrix[i+1][j] and matrix[i][j] > matrix[i][j-1] and matrix[i][j] > matrix[i][j+1]:
                       peaks += 1
           return peaks

    C) def countPeaks(matrix):
           peaks = 0
           for i in range(len(matrix)):
               for j in range(len(matrix[i])):
                   neighbors = []
                   if i > 0:
                       neighbors.append(matrix[i-1][j])
                   if i < len(matrix)-1:
                       neighbors.append(matrix[i+1][j])
                   if j > 0:
                       neighbors.append(matrix[i][j-1])
                   if j < len(matrix[i])-1:
                       neighbors.append(matrix[i][j+1])
                   if all(matrix[i][j] > neighbor for neighbor in neighbors):
                       peaks += 1
           return peaks

    D) def countPeaks(matrix):
           peaks = 0
           for i in range(len(matrix)):
               for j in range(len(matrix[i])):
                   if matrix[i][j] > matrix[i][j-1] and matrix[i][j] > matrix[i][j+1]:
                       peaks += 1
           return peaks
    """

def question_6():
    """
    What is the output of the snippet of code below?

    matrix = [[3,4,6],[2,3,5],[2,5,2]]
    mat = matrix
    mat[0][2] = [3]
    matrix[1] = [10,5]
    for row in matrix:
        for element in row:
            print(element, end=" ")
    print()

    A) 3 4 [3] 10 5 2 5 2
    B) SyntaxError: invalid syntax
    C) 3 4 6 10 5 2 5 2
    D) TypeError: print() got an unexpected keyword argument
    """

def question_7():
    """
    What is the output of the following code?

    numbers = [5,10,15,20]
    index = "2" + 1
    print(numbers[index])

    A) This code produces a TypeError
    B) This code produces a ValueError
    C) This code produces a NameError
    D) 20
    """

def question_8():
    """
    Trace the following snippet of code and provide the expected output.

    tuple_a = (1,2,[3,4])
    tuple_b = tuple_a
    tuple_a[2].append(5)
    tuple_b += (6,7)
    print("tuple_a:", tuple_a)
    print("tuple_b:", tuple_b)

    A) tuple_a: (1, 2, [3, 4, 5])
       tuple_b: (1, 2, [3, 4, 5], 6, 7)

    B) tuple_a: (1, 2, [3, 4, 5])
       tuple_b: (1, 2, [3, 4], 6, 7)

    C) tuple_a: (1, 2, [3, 4])
       tuple_b: (1, 2, [3, 4, 5], 6, 7)

    D) This code produces a TypeError
    """

def question_9():
    """
    Write a function countsky(matrix, digit) that takes a 2D list matrix of strings and an integer digit. The function should return how many times digit appears in the entire matrix.

    Which of the following is the correct implementation of countsky?

    A) def countsky(matrix, digit):
           count = 0
           for row in matrix:
               for element in row:
                   if element == str(digit):
                       count += 1
           return count

    B) def countsky(matrix, digit):
           count = 0
           for row in matrix:
               for element in row:
                   if element == digit:
                       count += 1
           return count

    C) def countsky(matrix, digit):
           count = 0
           for row in matrix:
               for element in row:
                   if str(digit) in element:
                       count += 1
           return count

    D) def countsky(matrix, digit):
           count = 0
           for row in matrix:
               for element in row:
                   if element.count(str(digit)) > 0:
                       count += 1
           return count
    """

def question_10():
    """
    Given the DataFrame df, filter out only the rows where Age (that appears in df) is greater than 23.

    Which of the following is the correct way to filter the DataFrame?

    A) df[df['Age'] > 23]
    B) df.loc[df['Age'] > 23]
    C) df.iloc[df['Age'] > 23]
    D) df[df.Age > 23]
    """

def question_11():
    """
    What will print after the following snippet of code is executed?

    lst = [[1,2,3,4],[5,6,7,8],[8,10,11,12]]
    for i in range(1, len(lst)):
        for j in range(len(lst[i]) - 1):
            temp = lst[i][j]
            lst[i][j] = lst[i-1][j+1] * 2
            if lst[i][j] % 5 == 0 and lst[i][j] < 30:
                lst[i][j] = "multiple5"
    for row in lst:
        print(row)

    A) [[1, 2, 3, 4], [4, 6, 8, 8], [20, 22, 24, 12]]
    B) [[1, 2, 3, 4], ['multiple5', 6, 8, 8], ['multiple5', 22, 24, 12]]
    C) [[1, 2, 3, 4], [4, 6, 8, 8], [20, 22, 24, 12]]
    D) [[1, 2, 3, 4], ['multiple5', 'multiple5', 8, 8], ['multiple5', 'multiple5', 24, 12]]
    """

def question_12():
    """
    Consider the following snippet of code. The goal of the count_frequencies function is to count how many times each number appears in a list and store the frequency in a dictionary. The keys of the dictionary will be the numbers from the list, and the values will be how many times those numbers appear. However, there are four mistakes/bugs in the code.

    def count_frequencies(nums):
        freq = []
        for num in nums:
            if num not in nums:
                freq[num] += 1
            else:
                freq[num] = 1
        return freq

    Which of the following correctly identifies the mistakes?

    A) freq is initialized as a list instead of a dictionary, 'not in nums' should be 'not in freq', freq[num] should be freq[num] + 1, and freq[num] = 1 should be inside an else clause.

    B) freq is initialized as a list instead of a dictionary, 'not in nums' should be 'not in freq', freq[num] += 1 should be freq[num] = freq.get(num, 0) + 1, and freq[num] = 1 is incorrect.

    C) freq is initialized as a dictionary, but the code tries to access it like a list, 'not in nums' should be 'not in freq', and the increment should use freq.get().

    D) The function is missing a return statement, freq is not initialized, and the if condition is incorrect.
    """

def question_13():
    """
    What is the output of the following snippet of code?

    def process_tuples(tup1, tup2):
        result = []
        for i in range(len(tup1)):
            result.append(tup1[i] + tup2[i])
        return tuple(result)
    t1 = (1,2,3)
    t2 = (4,5,6)
    output = process_tuples(t1, t2)
    print(output)

    A) (5, 7, 9)
    B) [5, 7, 9]
    C) (1, 2, 3, 4, 5, 6)
    D) This code produces an IndexError
    """

def question_14a():
    """
    Consider the following snippet of code:

    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    data = {
        'Student': ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],
        'Math': [85,92,78,88,95],
        'Science': [90,87,82,84,91],
        'English': [88,91,79,85,92]
    }
    df = pd.DataFrame(data)

    Using NumPy, compute the average score of each student across all subjects.

    Which of the following is the correct way to compute the average scores?

    A) df[['Math', 'Science', 'English']].mean(axis=1)
    B) np.mean(df[['Math', 'Science', 'English']], axis=1)
    C) df[['Math', 'Science', 'English']].apply(np.mean, axis=1)
    D) All of the above
    """

def question_14b():
    """
    Create a new column in the DataFrame called 'Average' that contains the average score for each student.

    Which of the following is the correct way to add the 'Average' column?

    A) df['Average'] = df[['Math', 'Science', 'English']].mean(axis=1)
    B) df['Average'] = np.mean(df[['Math', 'Science', 'English']], axis=1)
    C) df['Average'] = df.apply(lambda row: (row['Math'] + row['Science'] + row['English']) / 3, axis=1)
    D) All of the above
    """

def question_14c():
    """
    Plot a bar graph of the average scores for all students using Matplotlib. The x-axis should represent the students' names and the y-axis should represent their average scores. Label the axes and give the plot a title.

    Which of the following is the correct Matplotlib code to achieve this?

    A) plt.bar(df['Student'], df['Average'])
       plt.xlabel('Student')
       plt.ylabel('Average Score')
       plt.title('Average Scores of Students')
       plt.show()

    B) plt.plot(df['Student'], df['Average'], kind='bar')
       plt.xlabel('Student')
       plt.ylabel('Average Score')
       plt.title('Average Scores of Students')
       plt.show()

    C) df.plot.bar(x='Student', y='Average')
       plt.xlabel('Student')
       plt.ylabel('Average Score')
       plt.title('Average Scores of Students')
       plt.show()

    D) All of the above
    """

def question_15():
    """
    What is the value of d1 after the following snippet of code is executed?

    d1 = {3: 4, 5: 6, 7: 8}
    for i in range(len(d1)):
        d1[i+2] = i+5

    A) {3: 4, 5: 6, 7: 8, 2: 5, 3: 6, 4: 7}
    B) {2: 5, 3: 6, 4: 7}
    C) {3: 6, 5: 6, 7: 8, 2: 5, 4: 7}
    D) {3: 4, 5: 6, 7: 8}
    """

def question_16():
    """
    Consider a dictionary with keys as integers in increasing order (from 1) and values paired with each as a tuple of length 2. The first element of the tuple is an integer, while the second element is a list containing 2 integers. Write a function tuppleIsEqual, which checks if the sum of the integers of the list (inside the tuple) is equal to the first element of the tuple. If not, then change the contents of the list so that the sum of the integers of the list are equal to the first element of the tuple. Return a list containing all the finalized lists from smallest sum to largest.

    Example:
    Before function:
    d1 = {1:(5, [2, 3]), 2:(4, [4, 5]), 3:(6, [1, 4])}
    After function call:
    d1 = {1:(5, [2, 3]), 2:(4, [4, 0]), 3:(6, [1, 5])}
    return: [[4, 0], [2, 3], [1, 5]]

    Which of the following is the correct implementation of tuppleIsEqual?

    A) def tuppleIsEqual(d):
           result = []
           for key in d:
               target, lst = d[key]
               if sum(lst) != target:
                   lst[1] = target - lst[0]
               result.append(lst)
           return sorted(result, key=sum)

    B) def tuppleIsEqual(d):
           result = []
           for key in d:
               target, lst = d[key]
               if sum(lst) != target:
                   lst[1] = target - lst[0]
               result.append(lst)
           return result

    C) def tuppleIsEqual(d):
           result = []
           for key in sorted(d):
               target, lst = d[key]
               if sum(lst) != target:
                   lst[1] = target - lst[0]
               result.append(lst)
           return result

    D) def tuppleIsEqual(d):
           result = []
           for key in d:
               target, lst = d[key]
               if sum(lst) != target:
                   lst[0] = target - lst[1]
               result.append(lst)
           return sorted(result, key=sum)
    """

def question_17():
    """
    What is the output of the snippet of code below?

    t = ((3, 2, 6), (5, 2, 1), (4, 8))
    def elementsTuple(t: tuple):
        l = []
        for tup in t:
            for i in range(len(tup)):
                l.append(tup[i])
        l = tuple(sorted(l))
        return l
    print(elementsTuple(t))

    A) (1, 2, 2, 3, 4, 5, 6, 8)
    B) (1, 2, 3, 4, 5, 6, 8)
    C) (3, 2, 6, 5, 2, 1, 4, 8)
    D) (1, 2, 2, 3, 4, 5, 6, 8, 2)
    """

def question_18():
    """
    What is the output of the snippet of code below?

    lst = [[5,5,4],
           [8,4,7],
           [2,5,1]]
    def checkSum(lst):
        sum1 = 0
        sum2 = 0
        for i in range(len(lst)):
            sum1 += lst[i][i]
            sum2 += lst[i][-1-i]
        return sum1 == sum2
    print(checkSum(lst))

    A) True
    B) False
    C) This code produces an IndexError
    D) This code produces a TypeError
    """

def question_19():
    """
    What is the output of the following snippet of code?

    products = {'laptop': 800, 'phone': 600, 'tablet': 400, 'headphones': 150}
    discounts = {'laptop': 10, 'phone': 5, 'tablet': 20}
    for product in discounts:
        if product in products:
            products[product] = products[product] * (1 - discounts[product]/100)
    print(products)

    A) {'laptop': 720, 'phone': 570, 'tablet': 320, 'headphones': 150}
    B) {'laptop': 800, 'phone': 600, 'tablet': 400, 'headphones': 150}
    C) {'laptop': 760, 'phone': 570, 'tablet': 320, 'headphones': 150}
    D) {'laptop': 720, 'phone': 570, 'tablet': 320, 'headphones': 150}
    """

def question_20():
    """
    What is the output of the following snippet of code?

    tuple = (10,20,30,40)
    lst = list(tuple)
    lst[1] = "Hello"
    print(tuple)
    print(lst)

    A) (10, 20, 30, 40)
       [10, 'Hello', 30, 40]

    B) (10, 'Hello', 30, 40)
       [10, 'Hello', 30, 40]

    C) This code produces a TypeError
    D) This code produces a SyntaxError
    """

def question_21():
    """
    Given a dataset containing information (month, sales, expenses) about a store over a period of 6 months, which of the following correctly calculates the profit for each month?

    A) profit = sales - expenses
    B) profit = sales + expenses
    C) profit = sales * expenses
    D) profit = sales / expenses
    """

def question_22():
    """
    Given a list of tuples, with each tuple representing the month, the revenue, and the number of items sold, which of the following correctly calculates the sum of all items sold?

    A) total_items = sum([t[2] for t in tuples])
    B) total_items = sum(t[2] for t in tuples)
    C) total_items = sum(tuples[:, 2])
    D) Both A and B
    """

def question_23():
    """
    You are given a 2D list (matrix) of integers of size m × n. Write a function lolipop_wrap(matrix) to return the elements of the matrix in spiral order, starting from the top-left corner and moving inward in a clockwise direction.

    Which of the following is a correct step in implementing the spiral order traversal?

    A) Traverse the top row from left to right, then the right column from top to bottom, then the bottom row from right to left, then the left column from bottom to top.
    B) Traverse the top row from left to right, then the bottom row from left to right, then the right column from top to bottom, then the left column from top to bottom.
    C) Traverse the left column from top to bottom, then the bottom row from left to right, then the right column from bottom to top, then the top row from right to left.
    D) Traverse the top row from right to left, then the left column from top to bottom, then the bottom row from left to right, then the right column from bottom to top.
    """

def question_24():
    """
    What is the output of the following code snippet?

    d1 = {3: 5, 4: 5, 1: 5, 11: 42, 0.5: 12}
    d2 = {9: 45, 16: 37, 25: 1, 11: 51, 144: 0.25}
    output = []
    for key in d1:
        if d1[key] ** 2 in d2 and key == d2[d1[key] ** 2]:
            output.append(True)
        else:
            output.append(False)
    print(output)

    A) [False, False, False, False, False]
    B) [True, True, True, True, True]
    C) [False, False, False, True, False]
    D) This code produces a KeyError
    """

def question_25():
    """
    What is the output of the following snippet of code?

    d = {(3,4): 12, (4,5): 9, (10,10): 100, (2,2): 4, (10,20): 200}
    param1 = []
    for key in d:
        if key[0] * key[1] == d[key]:
            param1.append(True)
        else:
            param1.append(False)
    param2 = [key[0] + key[1] == d[key] for key in d]
    output = [param1[i] == param2[i] for i in range(len(param1))]
    for i in range(len(output)):
        print(output[i], end=" ")

    A) True False True False True
    B) False True False True False
    C) True True True True True
    D) False False False False False
    """

def question_26():
    """
    What is the output of the following snippet of code?

    def al(n):
        return chr(65 + n)
    k = {}
    for i in range(26):
        k[i] = al(i)
        k[al(i)] = al(i + 1)
        if i > 0:
            k[i - 1] = al(i + 2)
    print(k[12])

    A) 'M'
    B) 'O'
    C) 'P'
    D) 'N'
    """

def question_27():
    """
    What is the output of the following snippet of code? What is the time complexity of the code below?

    a = [[]]
    for i in range(10):
        if i % 3 == 1:
            a.append([])
            for j in range(3):
                a[-1].append([j ** 2])
        elif i % 2 == 0:
            a[-1].append(3)
    print(a[1])

    A) [[0], [1], [4], 3]
    B) [[0, 1, 4], 3]
    C) [3, [0, 1, 4]]
    D) This code produces an IndexError
    """

def question_28():
    """
    What is the output of the snippet of code below?

    count = 0
    for i in range(1, 5):
        for j in range(i, 5):
            for k in range(1, j+2):
                count += 1
    print(count)

    A) 60
    B) 70
    C) 80
    D) 90
    """

def question_29():
    """
    What is the output of the snippet of code below?

    def tuples(t):
        a, b, c = t
        new_tuple = (b+c, a * 2, c-a)
        return new_tuple
    original_tuple = (4, 7, 10)
    result = tuples(original_tuple)
    print(result)

    A) (17, 8, 6)
    B) (17, 8, -6)
    C) (11, 8, 6)
    D) (17, 4, 6)
    """

def question_30():
    """
    Rewrite the snippet of code below to fix the errors within. Not all errors will be seen with the inputs provided. Think outside the box! Assume both lst_of_keys and lst will always be lists with any values. Assume lst_of_keys will never have repeated values. Assume len(lst) will be >= len(lst_of_keys). Print out the result of the function.

    lst_of_keys = [3, None, "a", False, 16.0]
    lst = [[3, 5, 16], ["L", "i", "E", "c"], 145, "Computers", None, 1600.45, "yay!"]
    def listToDict(lst_of_keys, lst):
        temp_dict = {}
        for i in range(len(lst_of_keys)):
            temp_dict[lst_of_keys[i]] = lst[i]
        return temp_dict

    Which of the following is the correct output for listToDict(lst_of_keys, lst)?

    A) {3: [3, 5, 16], None: ["L", "i", "E", "c"], "a": 145, False: "Computers", 16.0: None}
    B) {3: [3, 5, 16], None: ["L", "i", "E", "c"], "a": 145, False: "Computers", 16.0: 1600.45}
    C) {3: [3, 5, 16], "a": 145, False: "Computers", 16.0: None}
    D) This code produces a TypeError
    """

def question_31():
    """
    What will be the output of the following code snippet? Explain why.

    d = {'a': 10, 'b': 20, 'c': 30}
    d['d'] = d.get('e', 40)
    print(d)

    A) {'a': 10, 'b': 20, 'c': 30, 'd': 40}
    B) {'a': 10, 'b': 20, 'c': 30, 'e': 40}
    C) {'a': 10, 'b': 20, 'c': 30, 'd': None}
    D) This code produces a KeyError
    """

def question_32():
    """
    A teacher is keeping track of students' grades using a dictionary where the keys are student names, and the values are lists of grades. The teacher wants to calculate the average grade for each student and find the student with the highest average grade. The following Python code has several bugs.

    students = {
        'Alice': [85, 90, 78],
        'Bob': [92, 88, 95],
        'Charlie': [70, 80, 65],
        'David': [100, 98, 95]
    }
    highest_avg = 0
    top_student = ""
    for student, grades in students:
        total = 0
        for grade in grades:
            total += grade
        average = total / len(grades)
        if average > highest_avg:
            highest_avg = average
            top_student = student
    print(f"The student with the highest average is {top_student} with an average of {highest_avg}.")

    Which of the following correctly identifies the errors?

    A) The loop should be for student, grades in students.items(), len(grade) should be len(grades), and top_student == student should be top_student = student
    B) The loop should be for student in students, average calculation is incorrect, and the print statement has a syntax error
    C) The dictionary is not properly defined, the loop is incorrect, and the average calculation is wrong
    D) There are no errors in the code
    """

def question_33():
    """
    What is the output of the following snippet of code? Show your work for each step.

    butterflies = {
        "name": "Monarch",
        "count": 10,
        "Location": ["forest", "lake"]
    }
    butterflies["count"] = butterflies.get("count", 0) + 1
    if "colour" not in butterflies.keys():
        butterflies["colour"] = "orange"
    butterflies.get("Location", []).append("meadow")
    for key in butterflies:
        print(f"{key} : {butterflies[key]}")

    A) name : Monarch
       count : 11
       Location : ['forest', 'lake', 'meadow']
       colour : orange

    B) name : Monarch
       count : 10
       Location : ['forest', 'lake']
       colour : orange

    C) name : Monarch
       count : 11
       Location : ['forest', 'lake']
       colour : orange

    D) This code produces a KeyError
    """

def question_34():
    """
    There are 3 mistakes in the snippet of code given below. The expected output is 120. What are the mistakes and what are their types? Fix all mistakes.

    def factorial(n):
        result = 1
        for i in range(1, n):
            result *= i
        return result
    print("Factorial of 5 is: ", factorial[5])

    Which of the following correctly identifies the mistakes?

    A) The range should be range(1, n+1), the return should be return result, and factorial[5] should be factorial(5)
    B) The function is missing a parameter, the loop is incorrect, and the print statement has a syntax error
    C) The function is not defined correctly, the loop is wrong, and the return statement is incorrect
    D) There are no mistakes in the code
    """

def question_35():
    """
    Determine the output of the following snippet of code.

    def tricky13Merge(d1: dict, d2: dict):
        temp = d1
        d1[13] = d2.get(13, 'lucky')
        value = max(d1)
        d1 = d1.update(d2)
        for key in temp:
            temp[key] = d2.get(key, temp.get(key))
        return d1, value
    temp = {}
    d1, d2 = {1: 2, 2: 3, 3: 4}, {0: 13, 2: 13, 4: 12, 13: [0, 2, 4]}
    for key in d1:
        if key in d2:
            d1[key] = tricky13Merge(d2, d1)
    print(d1)
    print(d2)
    print(temp)

    A) {1: 2, 2: (None, 13), 3: 4}
       {0: 13, 2: 13, 4: 12, 13: [0, 2, 4]}
       {}

    B) {1: 2, 2: (None, 13), 3: 4}
       {0: 13, 2: 13, 4: 12, 13: [0, 2, 4], 1: 2, 3: 4}
       {1: 2, 2: 13, 3: 4}

    C) This code produces a TypeError
    D) This code produces a KeyError
    """

def question_36():
    """
    What is the output of the following code snippet?

    total = 0
    for i in range(10):
        if i % 3 == 0:
            total += i
    print('3' * (total//3))

    A) 333333
    B) 333
    C) 333333333
    D) This code produces a TypeError
    """

def question_37():
    """
    This code snippet below creates a sorted list. Does it break at runtime?

    matrix = [[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]]
    sorted_lst = [vector[v] for v in range(2) for vector in matrix]

    A) Yes, it produces an IndexError
    B) No, it runs successfully
    C) Yes, it produces a SyntaxError
    D) Yes, it produces a TypeError
    """

def question_38():
    """
    Consider the matrix in Question 37. What is the output of the snippet of code below after execution?

    num, num1 = matrix[0], matrix[1]
    if not num > num1 or num1[len(num1)-1] < 10:
        print('ok')

    A) 'ok'
    B) Nothing is printed
    C) This code produces a TypeError
    D) This code produces a SyntaxError
    """

def question_39():
    """
    Given an empty dictionary, which of the following are valid ways to add an element to it?

    A) d = {}
       d['key'] = 'value'

    B) d = {}
       d.update({'key': 'value'})

    C) d = {}
       d.setdefault('key', 'value')

    D) All of the above
    """

def question_40():
    """
    Given the snippet of code below, what will the output be after it is done executing?

    lst = [1,2,3]
    letter = 'A'
    num1 = [42]
    num2 = 2
    letter.append('B')
    print(lst + letter)

    A) [1, 2, 3, 'A', 'B']
    B) This code produces an AttributeError
    C) This code produces a TypeError
    D) This code produces a SyntaxError
    """

def question_41():
    """
    Create a function that returns a dictionary of n numbers, each key should contain in a list if the number is prime or composite, even or odd, and a list of all the divisors for that number.

    Which of the following is the correct classification for the number 4?

    A) ['composite', 'even', [1,2,4]]
    B) ['prime', 'even', [1,2,4]]
    C) ['composite', 'odd', [1,2,4]]
    D) ['prime', 'odd', [1,2,4]]
    """

def question_42():
    """
    What is the output of the code below?

    def words(lst):
        dict = {}
        for word in lst:
            l_counts = {}
            for letter in word:
                if letter in l_counts:
                    l_counts[letter] += 1
                else:
                    l_counts[letter] = 1
            m_count = 0
            max_l = []
            for letter, count in l_counts.items():
                if count > m_count:
                    m_count = count
                    max_l = [letter]
                elif count == m_count:
                    max_l.append(letter)
            chosen = min(max_l)
            if chosen not in dict:
                dict[chosen] = []
            dict[chosen].append(word)
        to_remove = [key for key in dict if len(dict[key]) <= 1]
        for key in to_remove:
            del dict[key]
        new_keys = sorted(dict.keys())
        new_dict = {key: dict[key] for key in new_keys}
        print(new_dict)

    lst = ['big', 'but', 'born', 'alt', 'any', 'little', 'lots', 'bill', 'almost', 'giraffe', 'fox']
    words(lst)

    A) {'b': ['big', 'but', 'bill'], 'l': ['little', 'lots']}
    B) {'a': ['alt', 'any', 'almost'], 'b': ['big', 'but', 'bill'], 'f': ['fox'], 'g': ['giraffe'], 'l': ['little', 'lots'], 'r': ['born']}
    C) {'b': ['big', 'but', 'bill'], 'l': ['little', 'lots'], 'a': ['alt', 'any', 'almost']}
    D) This code produces a KeyError
    """

def question_43():
    """
    What is the output of the following snippet of code?

    k = 0
    for i in range(1, 5):
        for j in range(i):
            k += i
    print(k)

    A) 20
    B) 30
    C) 40
    D) 50
    """

def question_44():
    """
    Assuming food_df contains 3 columns (apples, bananas, and burgers) with 100 rows each, what would the following code print?

    fruits_df = food_df[['apples', 'bananas']]
    print(fruits_df.head(10))

    A) The first 10 rows of the 'apples' and 'bananas' columns
    B) The last 10 rows of the 'apples' and 'bananas' columns
    C) The first 10 rows of all columns
    D) This code produces a KeyError
    """

def question_45():
    """
    Write a function called calculate_revenue that takes three lists as input: products, quantities, and prices. The function should return a dictionary where the keys are product names and the values are the total revenue for each product.

    Which of the following is the correct implementation?

    A) def calculate_revenue(products, quantities, prices):
           revenue = {}
           for p, q, pr in zip(products, quantities, prices):
               if p in revenue:
                   revenue[p] += q * pr
               else:
                   revenue[p] = q * pr
           return revenue

    B) def calculate_revenue(products, quantities, prices):
           revenue = {}
           for i in range(len(products)):
               p = products[i]
               q = quantities[i]
               pr = prices[i]
               if p in revenue:
                   revenue[p] += q * pr
               else:
                   revenue[p] = q * pr
           return revenue

    C) def calculate_revenue(products, quantities, prices):
           from collections import defaultdict
           revenue = defaultdict(float)
           for p, q, pr in zip(products, quantities, prices):
               revenue[p] += q * pr
           return dict(revenue)

    D) All of the above
    """

def question_46():
    """
    The following code manipulates a 2D list. What is the final output?

    matrix = [[1,2,3],[4,5,6],[7,8,9]]
    total = 0
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if i == j:
                total += matrix[i][j] * 2
            else:
                total -= matrix[i][j]
    print(total)

    A) 15
    B) -15
    C) 30
    D) -30
    """

def question_47():
    """
    What is the output of the following snippet of code?

    def modify_tuple(t):
        x, y, z = t
        new_t = (z, x + y, y - z)
        return new_t
    tuple = ((5,2,8),(3,6,1),(4,9,7))
    lst = []
    for i in tuple:
        lst.append(modify_tuple(i))
    print(lst[1][2] + lst[2][0])

    A) 8
    B) 10
    C) 12
    D) 14
    """

def question_48():
    """
    What is the output of the following snippet of code?

    lst = [[2,4,6],[1,3,5],[7,9,11]]
    for i in range(len(lst)):
        for j in range(len(lst[i])):
            if i == j:
                lst[i][j] *= -1
            elif i < j:
                lst[i][j] += lst[j][i]
    for row in lst:
        print(row)

    A) [-2, 4, 6]
       [1, -3, 5]
       [7, 9, -11]

    B) [-2, 5, 7]
       [2, -3, 8]
       [8, 12, -11]

    C) [-2, 4, 6]
       [1, -3, 5]
       [7, 9, -11]

    D) This code produces an IndexError
    """

def question_49():
    """
    Create a function called string_slice that takes in two values "a" (an integer) and "b" (a string). The variable "a" controls the maximum parts up to which the string "b" should be sliced, starting from 1. The purpose of this function is to generate a 2D list with each amount of slicing subjected to the string.

    Example:
    string_slice(3, "roller") → [["roller"], ["rol", "ler"], ["ro", "ll", "er"]]

    Which of the following is the correct implementation?

    A) def string_slice(a, b):
           result = []
           for i in range(1, a+1):
               parts = [b[j:j+len(b)//i] for j in range(0, len(b), len(b)//i)]
               result.append(parts)
           return result

    B) def string_slice(a, b):
           result = []
           for i in range(1, a+1):
               parts = [b[j:j+i] for j in range(0, len(b), i)]
               result.append(parts)
           return result

    C) def string_slice(a, b):
           result = []
           for i in range(1, a+1):
               parts = [b[j:j+len(b)//i] for j in range(0, len(b), len(b)//i)][:i]
               result.append(parts)
           return result

    D) def string_slice(a, b):
           result = []
           for i in range(1, a+1):
               parts = [b[j:j+i] for j in range(0, len(b), i)]
               result.append(parts[:i])
           return result
    """

def question_50():
    """
    Create a function called max_triangle_sum which takes a 6 × 4 matrix and outputs the maximum sum that can be gathered from the matrix based on values in a triangular configuration.

    Example:
    Matrix = [[0,1,0,0,0,0],
              [2,1,3,0,0,0],
              [0,0,0,0,3,0],
              [0,0,0,2,1,3]]

    max_triangle_sum(matrix): 9, since 3+2+1+3=9

    Which of the following is a correct approach to solve this problem?

    A) Iterate through each possible 3x3 submatrix and calculate the sum of the triangle formed by the top-left, top-right, and bottom-center elements.
    B) Use dynamic programming to find the maximum sum path in the matrix.
    C) Find all possible triangles in the matrix and calculate their sums.
    D) Use a sliding window approach to find the maximum sum of a triangular window.
    """

def question_51():
    """
    You want to cook a matcha cheesecake for your mom. However, the cooking book has all of the steps completely reversed and numbered +2. Fix the cookbook (which is actually a dictionary where the keys are the steps and the values are the step numbers) so you can cook the cheesecake! You also want to print a list with the steps for better readability.

    Which of the following is the correct way to fix the cookbook?

    A) Reverse the dictionary and adjust the step numbers by subtracting 2.
    B) Sort the dictionary by keys and adjust the step numbers.
    C) Create a new dictionary with correct step numbers.
    D) Use a list to store the steps in the correct order.
    """

def question_52():
    """
    You have a csv file called car_velocity.csv, which includes data of a car's velocity over time. You are to:
    - Read the csv file
    - Drop missing NaN values
    - Extract time and velocity columns
    - Compute summary statistics like (min, max, mean, count)
    - Plot a scatter plot with the labeled axes

    Which of the following is the correct code snippet to achieve this?

    A) import pandas as pd
       import matplotlib.pyplot as plt
       df = pd.read_csv('car_velocity.csv')
       df = df.dropna()
       time = df['time']
       velocity = df['velocity']
       print(velocity.min(), velocity.max(), velocity.mean(), velocity.count())
       plt.scatter(time, velocity)
       plt.xlabel('Time')
       plt.ylabel('Velocity')
       plt.show()

    B) import pandas as pd
       import matplotlib.pyplot as plt
       df = pd.read_csv('car_velocity.csv')
       df = df.fillna(0)
       time = df['time']
       velocity = df['velocity']
       print(velocity.min(), velocity.max(), velocity.mean(), velocity.count())
       plt.plot(time, velocity)
       plt.xlabel('Time')
       plt.ylabel('Velocity')
       plt.show()

    C) import pandas as pd
       import matplotlib.pyplot as plt
       df = pd.read_csv('car_velocity.csv')
       df = df.dropna()
       time = df['time']
       velocity = df['velocity']
       print(velocity.describe())
       plt.scatter(time, velocity)
       plt.xlabel('Time')
       plt.ylabel('Velocity')
       plt.show()

    D) All of the above
    """

def question_53():
    """
    In the code below, you have a 2-dimensional list that will always be of size n*n. You are to find 2 bugs in the code, and after fixing them, find out what prints.

    numbers = [
        [1,2,3],
        [4,5,6],
        [7,8,9]
    ]
    num = []
    for i in range(len(numbers)):
        for j in range(len(numbers)):
            if numbers[i][j] % 2 == 0:
                num.append(numbers[i][j])
    print("nums are:", num)

    Which of the following is the correct fixed code and output?

    A) numbers = [
           [1,2,3],
           [4,5,6],
           [7,8,9]
       ]
       num = []
       for i in range(len(numbers)):
           for j in range(len(numbers[i])):
               if numbers[i][j] % 2 == 0:
                   num.append(numbers[i][j])
       print("nums are:", num)
       Output: nums are: [2, 4, 6, 8]

    B) numbers = [
           [1,2,3],
           [4,5,6],
           [7,8,9]
       ]
       num = []
       for i in range(len(numbers)):
           for j in range(len(numbers)):
               if numbers[i][j] % 2 == 0:
                   num.append(numbers[i][j])
       print("nums are:", num)
       Output: nums are: [2, 4, 6, 8]

    C) numbers = [
           [1,2,3],
           [4,5,6],
           [7,8,9]
       ]
       num = []
       for i in range(len(numbers)):
           for j in range(len(numbers[i])):
               if numbers[i][j] % 2 == 0:
                   num.append(numbers[i][j])
       print("nums are:", num)
       Output: nums are: [2, 4, 6, 8]

    D) The code is correct as is, output: nums are: [2, 4, 6, 8]
    """

def question_54():
    """
    Given the snippet of code below, determine the output.

    lst = [[0,1],
           [4,3,9],
           [2,7,1]]
    def tuplePositionPair(lst):
        result = []
        for i in range(len(lst)):
            row = []
            for j in range(len(lst[i])):
                row.append((lst[i][j], i - j//2))
            result.append(row)
        return result

    What is the output of tuplePositionPair(lst)?

    A) [[(0, 0), (1, 0)], [(4, 1), (3, 1), (9, 0)], [(2, 2), (7, 2), (1, 1)]]
    B) [[(0, 0), (1, 0)], [(4, 1), (3, 0), (9, 0)], [(2, 2), (7, 1), (1, 1)]]
    C) [[(0, 0), (1, 0)], [(4, 1), (3, 1), (9, 1)], [(2, 2), (7, 2), (1, 2)]]
    D) This code produces an IndexError
    """

def question_55():
    """
    Say you have a CSV file named "random-data.csv". Which of the following is the correct sequence to handle the data?

    A) import pandas as pd
       df = pd.read_csv('random-data.csv')
       df = df.dropna()
       print(df.head())
       print(df.tail())
       print(df.describe())

    B) import pandas as pd
       df = pd.read_csv('random-data.csv')
       print(df.head())
       print(df.tail())
       df = df.dropna()
       print(df.describe())

    C) import pandas as pd
       df = pd.read_csv('random-data.csv')
       print(df.describe())
       df = df.dropna()
       print(df.head())
       print(df.tail())

    D) All of the above are correct sequences
    """

def question_56():
    """
    Using NumPy, calculate the average temperature in Fahrenheit from the given Celsius temperatures.

    data = {
        'Day': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'Temperature (C)': [22, 19, 25, 18, 21, 23, 20]
    }
    df = pd.DataFrame(data)

    Which of the following is the correct way to calculate the average Fahrenheit temperature?

    A) import numpy as np
       celsius = df['Temperature (C)'].values
       fahrenheit = (celsius * 9/5) + 32
       average_f = np.mean(fahrenheit)

    B) import numpy as np
       celsius = df['Temperature (C)']
       fahrenheit = (celsius * 9/5) + 32
       average_f = np.mean(fahrenheit)

    C) import numpy as np
       celsius = df['Temperature (C)'].to_numpy()
       fahrenheit = (celsius * 9/5) + 32
       average_f = np.mean(fahrenheit)

    D) All of the above
    """

def question_57():
    """
    What is the output of the following snippet of code?

    def update_inventory(item, quantity):
        inventory[item] = quantity
    inventory = {'apple': 10, 'banana': 5}
    update_inventory('orange', 3)
    print(inventory)

    A) {'apple': 10, 'banana': 5, 'orange': 3}
    B) {'apple': 10, 'banana': 5}
    C) This code produces a NameError
    D) This code produces a KeyError
    """

def question_58():
    """
    Write a program that takes an integer n as input from the user and prints a hollow diamond pattern with 2n-1 rows using asterisk (*).

    For n=3, what should the output look like?

    A)   *
        * *
       *   *
        * *
         *

    B)   *
        * *
       * * *
        * *
         *

    C)   *
        * *
       * * *
      * * * *
       * * *
        * *
         *

    D)   *
        * *
       *   *
      *     *
       *   *
        * *
         *
    """

def question_59():
    """
    Given the following code below, what is the output after execution?

    def calculate_rectangle_properties():
        length = input("Enter the length of the rectangle: ")
        width = input("Enter the width of the rectangle: ")
        area = length * width
        perimeter = 2 * (length + width)
        print(f"The area of the rectangle is {area}.")
        print(f"The perimeter of the rectangle is {perimeter}.")
    calculate_rectangle_properties()

    A) The area and perimeter are printed correctly
    B) This code produces a TypeError
    C) This code produces a SyntaxError
    D) This code produces a ValueError
    """

def question_60():
    """
    Given a list of dictionaries containing the information of different destinations of flights, use pandas to turn the data into a DataFrame after making a function flights_data that computes the total number of flights per destination.

    Which of the following is the correct implementation of flights_data?

    A) def flights_data(lst_o_dict):
           from collections import defaultdict
           total_flights = defaultdict(int)
           for d in lst_o_dict:
               total_flights[d['destination']] += d['flights']
           return {'total_flights_per_destination': dict(total_flights)}

    B) def flights_data(lst_o_dict):
           df = pd.DataFrame(lst_o_dict)
           total_flights = df.groupby('destination')['flights'].sum().to_dict()
           return {'total_flights_per_destination': total_flights}

    C) def flights_data(lst_o_dict):
           total_flights = {}
           for d in lst_o_dict:
               if d['destination'] in total_flights:
                   total_flights[d['destination']] += d['flights']
               else:
                   total_flights[d['destination']] = d['flights']
           return {'total_flights_per_destination': total_flights}

    D) All of the above
    """

def question_61():
    """
    Write a function dict_opp that combines 3 different dictionaries d1, d2, d3 into a new dictionary new_dict. If the key is an integer, the value should be the sum of everything in the lists. If the key is a string, it should not appear in the new dictionary. The keys should be in all of the dictionaries.

    Which of the following is the correct implementation?

    A) def dict_opp(d1, d2, d3):
           common_keys = set(d1.keys()) & set(d2.keys()) & set(d3.keys())
           new_dict = {}
           for key in common_keys:
               if isinstance(key, int):
                   new_dict[key] = sum(d1[key]) + sum(d2[key]) + sum(d3[key])
           return new_dict

    B) def dict_opp(d1, d2, d3):
           common_keys = set(d1.keys()) & set(d2.keys()) & set(d3.keys())
           new_dict = {}
           for key in common_keys:
               if isinstance(key, int):
                   new_dict[key] = sum(d1[key] + d2[key] + d3[key])
           return new_dict

    C) def dict_opp(d1, d2, d3):
           new_dict = {}
           for key in d1:
               if key in d2 and key in d3 and isinstance(key, int):
                   new_dict[key] = sum(d1[key]) + sum(d2[key]) + sum(d3[key])
           return new_dict

    D) Both A and C
    """

def question_62():
    """
    What is the output of the snippet of code below after execution?

    def transform_tuple(data):
        a, (b, c) = data
        b = list(b)
        for i in range(len(b)):
            b[i] += c[i]
        new_tuple = (sum(b) * a, tuple(b), c[:-1])
        return new_tuple
    data = (3, ((4,6,8),(5,7,9)))
    result = transform_tuple(data)
    print(data)
    print(result)

    A) (3, ((4,6,8),(5,7,9)))
       (63, (9,13,17), (5,7))

    B) (3, ((9,13,17),(5,7,9)))
       (63, (9,13,17), (5,7))

    C) This code produces a TypeError
    D) This code produces an IndexError
    """

def question_63():
    """
    What is the output of the code below after execution?

    def nested_loop_modify(n):
        lst = []
        for i in range(1, (n+1)):
            amount = []
            for j in range(n):
                amount.append(i * j)
            lst.append(amount)
        for x in range(n):
            for y in range(x, n):
                lst[y][x] += (x + y)
        return lst
    result = nested_loop_modify(4)
    for amount in result:
        print(amount)

    A) [0, 1, 2, 3]
       [2, 4, 6, 8]
       [4, 7, 10, 13]
       [6, 9, 12, 15]

    B) [0, 1, 2, 3]
       [1, 3, 5, 7]
       [2, 5, 8, 11]
       [3, 7, 11, 15]

    C) [0, 0, 0, 0]
       [0, 2, 4, 6]
       [0, 4, 8, 12]
       [0, 6, 12, 18]

    D) This code produces an IndexError
    """

def question_64():
    """
    Given a CSV file containing daily temperature readings for a city over a year, which of the following is the correct way to calculate the average monthly temperature using Pandas and NumPy?

    A) df = pd.read_csv('temperatures.csv')
       df['month'] = pd.to_datetime(df['date']).dt.month
       monthly_avg = df.groupby('month')['temperature'].mean()

    B) df = pd.read_csv('temperatures.csv')
       df['month'] = df['date'].apply(lambda x: x.split('-')[1])
       monthly_avg = df.groupby('month')['temperature'].mean()

    C) df = pd.read_csv('temperatures.csv')
       monthly_avg = df['temperature'].resample('M').mean()

    D) All of the above, depending on the date format
    """

def question_65():
    """
    You are given a dictionary with a student's subjects as keys and grades as values, and another dictionary indicating eligibility for extra credit. Calculate the final grades and print the subjects passed.

    Which of the following is the correct way to calculate the final grade if eligible for extra credit?

    A) final_grade = grade + 0.15 * grade
    B) final_grade = grade * 1.15
    C) final_grade = grade + 15
    D) Both A and B
    """

def question_66():
    """
    Given the code below, determine the final value of result after all loops finish.

    result = 0
    for i in range(1, 4):
        for j in range(i, 4):
            for k in range(1, j+1):
                result += (i * j - k)

    A) 60
    B) 70
    C) 80
    D) 90
    """

def question_67():
    """
    Write a Python function named wordCheck with two inputs: grid and word, that searches for the given word in a 3 × 3 2D character grid. The word can be found horizontally or vertically.

    Which of the following is the correct implementation?

    A) def wordCheck(grid, word):
           for row in grid:
               if ''.join(row) == word:
                   return True
           for col in range(3):
               if ''.join([grid[row][col] for row in range(3)]) == word:
                   return True
           return False

    B) def wordCheck(grid, word):
           for i in range(3):
               if grid[i][0] + grid[i][1] + grid[i][2] == word:
                   return True
               if grid[0][i] + grid[1][i] + grid[2][i] == word:
                   return True
           return False

    C) def wordCheck(grid, word):
           for row in grid:
               if word in ''.join(row):
                   return True
           for col in range(3):
               column = ''.join([grid[row][col] for row in range(3)])
               if word in column:
                   return True
           return False

    D) Both A and B
    """

def question_68a():
    """
    Create a 5 × 5 2D list using list comprehensions, where each element is initialized to -1.

    Which of the following is the correct code?

    A) matrix = [[-1 for _ in range(5)] for _ in range(5)]
    B) matrix = [[-1] * 5 for _ in range(5)]
    C) matrix = [[-1 for _ in range(5)] * 5]
    D) Both A and B
    """

def question_68b():
    """
    What is the time complexity of creating the 5 × 5 matrix using list comprehensions?

    A) O(1)
    B) O(n)
    C) O(n^2)
    D) O(log n)
    """

def question_69():
    """
    Write a function called group_reversed that takes a list of words and groups them into a dictionary where the keys are sorted versions of the words, and the values are the inverted version of the words IF they exist in the list.

    Which of the following is the correct implementation?

    A) def group_reversed(words):
           from collections import defaultdict
           groups = defaultdict(list)
           for word in words:
               sorted_word = ''.join(sorted(word))
               if word[::-1] in words:
                   groups[sorted_word].append(word[::-1])
           return dict(groups)

    B) def group_reversed(words):
           from collections import defaultdict
           groups = defaultdict(list)
           for word in words:
               sorted_word = ''.join(sorted(word))
               if word[::-1] in words:
                   groups[sorted_word].append(word)
           return dict(groups)

    C) def group_reversed(words):
           groups = {}
           for word in words:
               sorted_word = ''.join(sorted(word))
               if sorted_word not in groups:
                   groups[sorted_word] = []
               if word[::-1] in words:
                   groups[sorted_word].append(word[::-1])
           return groups

    D) Both A and C
    """

def question_70():
    """
    What is the output of the following snippet of code after execution?

    def modify_tuple(t):
        t[1][0] += 5
        return (t[0] * 2, t[1])
    t1 = (3, [4,5])
    t2 = modify_tuple(t1)
    print(t1)
    print(t2)

    A) (3, [4,5]) and (6, [9,5])
    B) (3, [9,5]) and (6, [9,5])
    C) (3, [4,5]) and (6, [4,5])
    D) This code produces a TypeError
    """

def question_71():
    """
    The function below should group a list of strings in a dictionary by length where the keys are integers representing the length of the word and the values are lists containing all words with the given length.

    def group_words_by_length(words):
        grouped = {}
        for word in words:
            length = len(word)
            if length in grouped:
                grouped[length].append(word)
            else:
                grouped[length] = [word]
        return grouped

    Which of the following is the correct fixed code?

    A) The code is already correct
    B) Change grouped[length] += word to grouped[length].append(word)
    C) Change grouped[length] = word to grouped[length] = [word]
    D) Both B and C
    """

def question_72():
    """
    Create a function that takes a list of strings and removes all asterisks (*) by modifying the original list.

    Which of the following is the correct implementation?

    A) def remove_asterisks(lst):
           for i in range(len(lst)):
               lst[i] = lst[i].replace('*', '')

    B) def remove_asterisks(lst):
           for word in lst:
               word = word.replace('*', '')

    C) def remove_asterisks(lst):
           lst = [word.replace('*', '') for word in lst]

    D) def remove_asterisks(lst):
           for i, word in enumerate(lst):
               lst[i] = ''.join([c for c in word if c != '*'])
    """

def question_73():
    """
    Create a coordinate system that asks for an input n from the user for an n x n grid and return the coordinates in 2D list format, starting from (0,0) at the bottom left of the grid. If n is odd, replace the middle tuple with " ++ ".

    Which of the following is the correct implementation for n=3?

    A) [[(0,2),(1,2),(2,2)],
        [(0,1)," ++ ",(2,1)],
        [(0,0),(1,0),(2,0)]]

    B) [[(0,0),(1,0),(2,0)],
        [(0,1)," ++ ",(2,1)],
        [(0,2),(1,2),(2,2)]]

    C) [[(2,2),(1,2),(0,2)],
        [(2,1)," ++ ",(0,1)],
        [(2,0),(1,0),(0,0)]]

    D) [[(0,0),(0,1),(0,2)],
        [(1,0),(1,1),(1,2)],
        [(2,0),(2,1),(2,2)]]
    """

def question_74():
    """
    What is the output of the following snippet of code below?

    def someFunction(n):
        lst = []
        for i in range(n):
            row = [j+1+i * n for j in range(n)]
            lst.append(row)
        for i in range(len(lst)):
            for j in range(len(lst[i])):
                for k in range(2, int(lst[i][j] * 0.5) + 1):
                    if lst[i][j] % k == 0:
                        lst[i][j] = 0
        return lst
    modified = someFunction(5)
    for row in modified:
        print(row)

    A) [[1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]]

    B) [[0, 0, 0, 0, 0],
        [0, 7, 0, 0, 0],
        [11, 0, 13, 0, 0],
        [0, 17, 0, 19, 0],
        [0, 0, 23, 0, 0]]

    C) [[1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]]

    D) This code produces an IndexError
    """

def question_75():
    """
    Given an upper integer limit of limit, write a function that returns all Pythagorean triples (a, b, c) where a^2 + b^2 = c^2 and a, b, c <= limit.

    Which of the following is the correct implementation with O(n^2) time complexity?

    A) def pythagorean_triples(limit):
           triples = []
           for a in range(1, limit+1):
               for b in range(a, limit+1):
                   c = (a**2 + b**2)**0.5
                   if c.is_integer() and c <= limit:
                       triples.append((a, b, int(c)))
           return triples

    B) def pythagorean_triples(limit):
           triples = []
           for c in range(1, limit+1):
               for a in range(1, c):
                   for b in range(a, c):
                       if a**2 + b**2 == c**2:
                           triples.append((a, b, c))
           return triples

    C) def pythagorean_triples(limit):
           triples = []
           for a in range(1, limit+1):
               for b in range(a, limit+1):
                   c_squared = a**2 + b**2
                   c = int(c_squared**0.5)
                   if c**2 == c_squared and c <= limit:
                       triples.append((a, b, c))
           return triples

    D) All of the above
    """

def question_76():
    """
    Given the snippet of code below, determine the number of mistakes in the code.

    word = []
    def asList(string):
        for i in range(0, len(string)):
            word.append(string[i])
    asList(input('Enter any word'))

    A) 1
    B) 2
    C) 3
    D) 4
    """

def question_77():
    """
    The given code below does not work as intended. Take the code and provide a corrected version that works properly. The code is made to take in tuples and add them to a list of items. This list is then read and the tuples are printed with the highest value in its last position.

    import random
    tuples = []
    words = ['this', 'code', 'sucks']
    for i in range(2):
        tuples.append((random.randint(1, 10), words[i]))
    def highestTuple(tuples):
        tuples.append((int(input('Give a number')), input('now give a word associated to that word')))
        tuples.sort(key=lambda x: x[0], reverse=True)
        print(tuples[0])

    Which of the following is the correct fixed code?

    A) import random
       tuples = []
       words = ['this', 'code', 'sucks']
       for i in range(2):
           tuples.append((random.randint(1, 10), words[i]))
       def highestTuple(tuples):
           new_tuple = (int(input('Give a number')), input('now give a word associated to that word'))
           tuples.append(new_tuple)
           tuples.sort(key=lambda x: x[0], reverse=True)
           print(tuples[0])

    B) import random
       tuples = []
       words = ['this', 'code', 'sucks']
       for i in range(2):
           tuples.append((random.randint(1, 10), words[i]))
       def highestTuple(tuples):
           new_tuple = (int(input('Give a number')), input('now give a word associated to that word'))
           tuples.append(new_tuple)
           print(max(tuples, key=lambda x: x[0]))

    C) Both A and B
    D) The code is correct as is
    """

def question_78():
    """
    Find 3 errors in the code below, explain them, and label them as 'Syntax', 'Runtime' or 'Semantic' errors. The purpose of the functions is to add each of the elements together and output the sum.

    def mysum1(m):
        output = 0
        for x in m:
            output += float(x)
        return x

    def mysum2(m):
        output = 0
        length_m = len(m)
        return sum([int(x)] for x in range(length_m))

    def mysum3(m):
        output = 0
        for x in m[-1:-1]:
            if type(x) == list:
                output += x[-1]
            else:
                output += float(x)
        return output

    def mysum4(m):
        output = 0
        for x in m:
            if type(x) == list:
                for k in x:
                    output += k
            else:
                output += float(x)
        return output

    m = [1, '2.5', [10], -1]

    Which of the following correctly identifies the errors?

    A) mysum1: returns x instead of output (Semantic), mysum2: incorrect use of sum and list comprehension (Semantic), mysum3: slice m[-1:-1] is empty (Semantic)
    B) mysum1: SyntaxError in return statement, mysum2: RuntimeError in sum, mysum3: TypeError in for loop
    C) mysum1: Semantic error in return, mysum2: Semantic error in list comprehension, mysum4: RuntimeError with float(x)
    D) All functions have SyntaxErrors
    """

def question_79():
    """
    Write a function called adjacents that takes in the parameter matrix (a nxn 2D list of ints). All values in the matrix have one digit except for 1, this value has 2 digits. The function should return the number of adjacent tiles to the 2 digit number (horizontal, vertical, and diagonal).

    Which of the following is the correct implementation?

    A) def adjacents(matrix):
           n = len(matrix)
           for i in range(n):
               for j in range(n):
                   if matrix[i][j] == 10:
                       count = 0
                       for di in [-1, 0, 1]:
                           for dj in [-1, 0, 1]:
                               if di == 0 and dj == 0:
                                   continue
                               ni, nj = i + di, j + dj
                               if 0 <= ni < n and 0 <= nj < n:
                                   count += 1
                       return count

    B) def adjacents(matrix):
           n = len(matrix)
           for i in range(n):
               for j in range(n):
                   if len(str(matrix[i][j])) == 2:
                       count = 0
                       for di in [-1, 0, 1]:
                           for dj in [-1, 0, 1]:
                               if di == 0 and dj == 0:
                                   continue
                               ni, nj = i + di, j + dj
                               if 0 <= ni < n and 0 <= nj < n:
                                   count += 1
                       return count

    C) def adjacents(matrix):
           n = len(matrix)
           count = 0
           for i in range(n):
               for j in range(n):
                   if matrix[i][j] == 10:
                       for di in [-1, 0, 1]:
                           for dj in [-1, 0, 1]:
                               if di == 0 and dj == 0:
                                   continue
                               ni, nj = i + di, j + dj
                               if 0 <= ni < n and 0 <= nj < n:
                                   count += 1
           return count

    D) Both A and B
    """

def question_80():
    """
    You are given a 2D list where each inner list contains a student's name, their class, and their scores across various subjects. Write a function organize_students that takes this list and returns a dictionary where the keys are class names and the values are dictionaries with student names and their average scores.

    Which of the following is the correct implementation?

    A) def organize_students(students):
           from collections import defaultdict
           classes = defaultdict(dict)
           for student in students:
               name, cls, *scores = student
               avg = sum(scores) / len(scores)
               classes[cls][name] = avg
           return dict(classes)

    B) def organize_students(students):
           classes = {}
           for student in students:
               name, cls, *scores = student
               avg = sum(scores) / len(scores)
               if cls not in classes:
                   classes[cls] = {}
               classes[cls][name] = avg
           return classes

    C) Both A and B
    D) def organize_students(students):
           classes = {}
           for student in students:
               name = student[0]
               cls = student[1]
               scores = student[2:]
               avg = sum(scores) / len(scores)
               if cls not in classes:
                   classes[cls] = {}
               classes[cls][name] = avg
           return classes
    """

def question_81():
    """
    Write a function that returns True if a given number exists in a 2D list and False otherwise.

    Which of the following is the correct implementation?

    A) def exists(matrix, target):
           for row in matrix:
               if target in row:
                   return True
           return False

    B) def exists(matrix, target):
           return any(target in row for row in matrix)

    C) def exists(matrix, target):
           for i in range(len(matrix)):
               for j in range(len(matrix[i])):
                   if matrix[i][j] == target:
                       return True
           return False

    D) All of the above
    """

def question_82():
    """
    You are provided with a CSV file (people.csv) that contains data about people, including their gender and age. Your goal is to read the CSV, filter females older than 20, and display 10 random values.

    Which of the following is the correct code snippet?

    A) import pandas as pd
       df = pd.read_csv('people.csv')
       females_over_20 = df[(df['gender'] == 'Female') & (df['age'] > 20)]
       print(females_over_20.sample(10))

    B) import pandas as pd
       df = pd.read_csv('people.csv')
       females = df[df['gender'] == 'Female']
       over_20 = females[females['age'] > 20]
       print(over_20.sample(10))

    C) Both A and B
    D) import pandas as pd
       df = pd.read_csv('people.csv')
       filtered = df.query("gender == 'Female' and age > 20")
       print(filtered.sample(10))
    """

def question_83():
    """
    Consider the following Python code snippet:

    my_tuple = ((1, 2, 3), [4, 5, 6], [7, 8, 9])
    my_tuple[1] = [10, 11, 12]
    my_tuple[1].append(1)
    my_tuple[0][1] = 20
    print(my_tuple)

    What is the error message, and how can it be fixed?

    A) TypeError: 'tuple' object does not support item assignment
       Fix: Change my_tuple to a list

    B) TypeError: 'tuple' object is not subscriptable
       Fix: Use a list instead of a tuple

    C) IndexError: list index out of range
       Fix: Check the index used

    D) No error, the code runs successfully
    """

def question_84():
    """
    You have a list of tuples, each with a food and a price. Prompt the user to enter how many of each they bought, then print a dictionary with food as keys and total price as values.

    Which of the following is the correct way to handle user input?

    A) food_lst = [("apples", 1.50), ("milk", 4.50), ("orange", 1.25), ("chicken", 8.50)]
       purchases = {}
       while True:
           line = input()
           if line == "DONE":
               break
           food, quantity = line.split()
           quantity = int(quantity)
           for f, p in food_lst:
               if f == food:
                   if food in purchases:
                       purchases[food] += p * quantity
                   else:
                       purchases[food] = p * quantity

    B) food_lst = {"apples": 1.50, "milk": 4.50, "orange": 1.25, "chicken": 8.50}
       purchases = {}
       while True:
           line = input()
           if line == "DONE":
               break
           food, quantity = line.split()
           quantity = int(quantity)
           if food in food_lst:
               if food in purchases:
                   purchases[food] += food_lst[food] * quantity
               else:
                   purchases[food] = food_lst[food] * quantity

    C) Both A and B
    D) Use a dictionary for food_lst and accumulate purchases
    """

def question_85():
    """
    Given the snippet of code below, what is the output after execution?

    d = {'a': 'apple', 'b': 'banana', 'c': 'cherry'}
    def manipDict(d):
        result = {}
        for key in d:
            value = d[key]
            if len(value) % 2 == 0:
                if "b" in value:
                    result[key] = value[::2]
                else:
                    result[key] = value[::-1]
            else:
                if "a" in value:
                    result[key] = value[1:] + value[0]
                else:
                    result[key] = value.upper()
        return result
    print(manipDict(d))

    A) {'a': 'pplea', 'b': 'bnn', 'c': 'yrrehc'}
    B) {'a': 'elppa', 'b': 'bnn', 'c': 'CHERRY'}
    C) {'a': 'apple', 'b': 'banana', 'c': 'cherry'}
    D) This code produces a KeyError
    """

def question_86():
    """
    What is the output for the following code?

    lst = [(num, [num**2, num+1]) for num in range(1,3)]
    num = lst[1][1]
    num[0] += 7
    print(num, lst)

    A) [16, 3] [(1, [1, 2]), (2, [16, 3])]
    B) [9, 3] [(1, [1, 2]), (2, [9, 3])]
    C) [16, 3] [(1, [1, 2]), (2, [4, 3])]
    D) This code produces an IndexError
    """

def question_87():
    """
    Given a DataFrame df with columns "height", "age", "weight", and "eye colour", which of the following Matplotlib code snippets correctly plots a scatter plot with age as x and weight as y with red coloured dots?

    A) import matplotlib.pyplot as plt
       plt.scatter(df['age'], df['weight'], color='red')
       plt.xlabel('Age')
       plt.ylabel('Weight')
       plt.title('Age vs Weight')
       plt.show()

    B) import matplotlib.pyplot as plt
       plt.plot(df['age'], df['weight'], 'ro')
       plt.xlabel('Age')
       plt.ylabel('Weight')
       plt.title('Age vs Weight')
       plt.show()

    C) import matplotlib.pyplot as plt
       plt.scatter(df['weight'], df['age'], color='red')
       plt.xlabel('Weight')
       plt.ylabel('Age')
       plt.title('Weight vs Age')
       plt.show()

    D) Both A and B
    """

def question_88():
    """
    What is the value of s after the following code runs?

    s = 'cat'
    s = s + '-'*3
    s = ''*2 + s
    s = s + 'dog'

    A) 'cat--- dog'
    B) '---catdog'
    C) 'dog ---cat'
    D) ' cat---dog'
    E) 'cat---dog'
    """

def question_89():
    """
    What is the output of the following code?

    s = 'It\'s a beautiful day!'
    d = "Let's go\t outside and play."
    s = s + '!!!\n' + d
    print(s)

    A) It's a beautiful day!!! Let's got outside and play.
    B) It's a beautiful day!!!
    Let's got outside and play.
    C) It's a beautiful day!!!!
    Let's go outside and play.
    D) It's a beautiful day!!!
    Let's go outside and play.
    E) This code produces a SyntaxError.
    """

def question_90():
    """
    What is the output of the following code?

    num = 3
    result = num == 8 or 3
    print(result)

    A) False
    B) True
    C) 8
    D) 3
    E) This code produces a TypeError
    """

def question_91():
    """
    >>> help(''.center)
    Help on built-in function center:
    center(width, fillchar=' ', /) method of builtins.strinstance
    Return a centered string of length width.
    Padding is done using the specified fill character (default is a space).

    What is the string produced by the following code:

    'cave'.center(8, 'x')

    A) 'xxcavexx'
    B) ' cave '
    C) 'xxxxcavexxxx'
    D) ' cave '
    """

def question_92():
    """
    Consider the following expression:

    a = True
    b = False
    c = True
    c or b and not a

    What is the value of the above expression?

    A) True
    B) False
    """

def question_93():
    """
    In the following expression, which parts are evaluated?

    (5 > 2) or ( (12 < 7) and (72 > 25) )

    A) Only the first condition
    B) Only the second condition
    C) Only the third condition
    D) The first and third conditions
    E) All of the code is evaluated
    """

def question_94():
    """
    In the following expression, which parts are evaluated?

    ( (5 > 2) and (12 < 7) ) or (72 > 25)

    A) Only the first condition
    B) Only the second condition
    C) Only the third condition
    D) The first and third conditions
    E) All of the code is evaluated
    """

def question_95():
    """
    How many lines are output by this nested loop?

    letters = 'ABC'
    numbers = '1234'
    for char in letters:
        for digit in numbers:
            print(char + digit)

    A) 3
    B) 6
    C) 9
    D) 12
    """

def question_96():
    """
    What is the output of the following code?

    count = 5
    while count > 0:
        print(f'iteration {count % 5}: apples and oranges')
        count -= 1

    A) iteration 0: apples and oranges
       iteration 4: apples and oranges
       iteration 3: apples and oranges
       iteration 2: apples and oranges
       iteration 1: apples and oranges

    B) iteration 0: apples and oranges
       iteration 1: apples and oranges
       iteration 2: apples and oranges
       iteration 3: apples and oranges
       iteration 4: apples and oranges

    C) iteration 5: apples and oranges
       iteration 4: apples and oranges
       iteration 3: apples and oranges
       iteration 2: apples and oranges
       iteration 1: apples and oranges
    """

def question_97():
    """
    What is the value of lst1 and lst2 respectively after the following code runs?

    lst1 = [1, 2, 3]
    lst2 = lst1 + lst1
    lst2[0] = 99

    A) lst1: [1, 2, 3], lst2: [99, 2, 3, 1, 2, 3]
    B) lst1: [99, 2, 3], lst2: [99, 2, 3, 1, 2, 3]
    C) lst1: [1, 2, 3], lst2: [1, 2, 3, 1, 2, 3]
    D) lst1: [99, 2, 3], lst2: [99, 2, 3, 99, 2, 3]
    E) None of the above
    """

def question_98():
    """
    What are the values of lst1 and lst2 respectively?

    lst1 = [1, 2, 3]
    lst2 = [lst1] + [lst1]
    lst2[0] = 99

    A) lst1: [1, 2, 3] lst2: [99, 2, 3, 1, 2, 3]
    B) lst1: [99, 2, 3] lst2: [99, 2, 3, 1, 2, 3]
    C) lst1: [1, 2, 3] lst2: [99, [1, 2, 3]]
    D) lst1: [99, 2, 3] lst2: [99, [1, 2, 3]]
    E) None of the above
    """

def question_99():
    """
    Is the following code correct?

    def product(x, y):
    return x*y
    x = 2
    y = 3
    x = product(2, 3)

    A) No bugs. The code is fine
    B) The function body is not indented
    C) We are using x as both parameter and a variable, but we are not allowed to do that
    D) Both B and C are bugs
    """

def question_100():
    """
    What is the output of this code?

    def result(x, y, z):
        a = x + z
        b = y * a
        return a + b - 4
    print(result(3, 2, 4))

    A) 7
    B) 4
    C) 17
    D) 9
    E) None of the above
    """

def question_101():
    """
    What is the output of this code?

    def a(num):
        return val + num + 3
    def b(val):
        return a(1)
    print(b(2))

    A) 6
    B) 7
    C) 4
    D) 5
    E) Error because of undefined variable
    """

def question_102():
    """
    What is the output of this code?

    def a(num):
        return val + num + 3
    def b(val):
        return val * 2
    print(b(2))

    A) 6
    B) 7
    C) 4
    D) 5
    E) Error because of undefined variable
    """

def question_103():
    """
    Do the following two snippets of code do the same thing?

    def mystery(s, lst):
        s = s.upper()
        lst = lst + [2]
    s = 'a'
    lst = [7]
    mystery(s, lst)
    print(s, lst)

    A) Yes
    B) No
    """

def question_104():
    """
    What prints when the following code is executed?

    def add(x, y):
        print(f'x + y = {x + y}')
    x = 5
    y = 7
    add(x, y)
    print(f'I hope the answer was right!')

    A)
      x + y = 12
      I hope the answer was right!

    B)
      12
      I hope the answer was right!

    C)
      x + y = 12

    D)
      I hope the answer was right!

    E) This code produces an error
    """

def question_105():
    """
    What prints when the following code is executed?

    def trickyAdd(x, y):
        y = y + 2
        print(f'x + y is = {x + x + y}')
    x = 5
    y = 7
    trickyAdd(y, x)
    print(f'I hope the answer was right!')

    A)
      x + y is = 21
      I hope the answer was right!

    B)
      x + y is = 19
      I hope the answer was right!

    C)
      x + y is = 14
      I hope the answer was right!

    D) This code produces an error
    E) None of the above
    """

def question_106():
    """
    What prints when the following code is executed?

    def trickierAdd(x, y):
        y = y + 2
        print(f'x + y is = {x + y}')
        return x + x + y
    x = 5
    y = 7
    x = trickierAdd(y, x)
    print(f'x + y = {x + y}')

    A)
      x + y is = 14
      x + y = 28

    B)
      x + y is = 12
      x + y = 19

    C)
      x + y is = 14
      x + y = 21

    D) This code produces an error
    E) None of the above
    """

def question_107():
    """
    What prints when the following code is executed?

    def trickierAdd(x, y):
        y = y + 2
        trickiestAdd(x, y)
        print(f'x + y = {x + y}')
        return x + x + y
    def trickiestAdd(y, x):
        x = x + 4
        print(f'x + y = {x + y}')
    x = 5
    y = 7
    print(f'x + y = {trickierAdd(y, x)}')

    A)
      x + y = 18
      x + y = 14
      x + y = 21

    B)
      x + y = 14
      x + y = 21

    C)
      x + y = 18
      x + y = 21

    D) This code produces an error
    E) None of the above
    """

def question_108():
    """
    What prints when the following code is executed?

    def doStuff(x, y):
        x[0] = 7
        y[1] = x[1]
        print(f'doStuff: {x[0]}{x[1]}{y[0]}{y[1]}')
        return x
    x = [3, 4]
    y = x
    y[0] = 1
    y = [0, 0]
    y[1] = 2
    print(f'Main 1: {x[0]}{x[1]}{y[0]}{y[1]}')
    y = doStuff(x, y)
    print(f'Main 2: {x[0]}{x[1]}{y[0]}{y[1]}')

    A)
      Main 1: 1402
      doStuff: 7404
      Main 2: 7474

    B)
      Main 1: 3402
      doStuff: 7404
      Main 2: 7474

    C)
      Main 1: 1402
      doStuff: 7404
      Main 2: 1402

    D) This code produces an error
    E) None of the above
    """

def question_109():
    """
    What prints when the following code is executed?

    def doStuff(y, x):
        x[0] = 7
        y[1] = x[1]
        print(f'doStuff: {x[0]}{x[1]}{y[0]}{y[1]}')
        return x
    x = [3, 4]
    y = x
    y[0] = 1
    y = [0, 0]
    y[1] = 2
    print(f'Main 1: {x[0]}{x[1]}{y[0]}{y[1]}')
    y = doStuff(x, y)
    print(f'Main 2: {x[0]}{x[1]}{y[0]}{y[1]}')

    A)
      Main 1: 1402
      doStuff: 7404
      Main 2: 7474

    B)
      Main 1: 3402
      doStuff: 7404
      Main 2: 7474

    C)
      Main 1: 1402
      doStuff: 7404
      Main 2: 1402

    D) This code produces an error
    E) None of the above
    """

def question_110():
    """
    What is the output of the following code?

    num1 = 2
    num2 = 3
    num3 = 12
    print(f'The product is: {num1*num2*num3}.')

    A) The product is: num1*num2*num3.
    B) The product is: 72.
    C) This code produces SyntaxError
    D) This code produces RuntimeError
    E) This code produces SemanticError
    """

def question_111():
    """
    What is the output of the following code?

    num1 = 2
    Num1 = 3
    Num3 = 4
    print(f'The product is: {num1*Num2*Num3}.')

    A) The product is: num1*Num2*Num3.
    B) The product is: 24.
    C) This code produces SyntaxError
    D) This code produces RuntimeError
    E) This code produces SemanticError
    """

def question_112():
    """
    What is the output of the following code?

    num1 = 2
    num2 = 3
    num3 = 12
    print("The sum is: " + num1 + num2 + num3)

    A) The sum is: 17
    B) This code produces a SemanticError
    C) This code produces a TypeError
    D) This code produces a RuntimeError
    E) More than one of the above
    """

def question_113():
    """
    What is the output of the following code?

    num = 2
    num2 = 3
    num3 = 12
    print("The sum is: ", num1 + num2 + num3)

    A) The sum is: 17
    B) This code produces a SyntaxError
    C) This code produces a RuntimeError
    D) This code produces a NameError
    E) More than one of the above
    """

def question_114():
    """
    What is the output after the following snippet of code is executed?

    num = [1, 2, 3, 4, 5]
    for i in range(len(num)):
        num[i] = num[i] * 2
    num = num + (6, 7)
    print(num)

    A) [1, 2, 3, 4, 5, 6, 7]
    B) [2, 4, 6, 8, 10, 6, 7]
    C) [2, 4, 6, 8, 10], (6, 7)
    D) [2, 4, 6, 8, 10], [6, 7]
    E) This code produces a TypeError
    """

def question_115():
    """
    What is the output after the following snippet of code is executed?

    num = [1, 2, 3, 4, 5]
    num += (2, 3)
    for i in range(len(num)):
        num[i] = num[i] * 2
    print(num)

    A) [1, 2, 3, 4, 5, 2, 3]
    B) [2, 4, 6, 8, 10, 4, 6]
    C) [2, 4, 6, 8, 10], (4, 6)
    D) [2, 4, 6, 8, 10], [4, 6]
    E) This code produces a TypeError
    """

def question_116():
    """
    What prints when the following code is executed?

    t = ('Feb', 17, 2025)
    t2 = ('Mar', 7, 2025)
    print(t + t2)
    t[0] = 'Apr'
    print(t)

    A) ('Feb', 17, 2025, 'Mar', 7, 2025)
       ('Apr', 17, 2025)

    B) ('Feb', 17, 2025, 'Mar', 7, 2025)
       This code produces a TypeError

    C) ('Feb', 'Mar', 17, 7, 2025, 2025)
       ('Apr', 17, 2025)

    D) This code produces a TypeError
    E) None of the above
    """

def question_117():
    """
    What prints when the following code is executed?

    t = ('apple', 17.3, [99, 98])
    t2 = (33.77, [7, 8])
    print(t[2] + t2[1])

    A) [99, 98, 7, 8]
    B) [99, 98, 33.77, 7, 8]
    C) [7, 8, 99, 98]
    D) This code produces a TypeError
    E) None of the above
    """

def question_118():
    """
    What prints when the following code is executed?

    t = ('apple', 17.3, [99, 98])
    tup = (t[2], ) + (3, ['apricot', 'pear'])
    tup[2] = ['tomato']
    print(tup)

    A) ([99, 98], 3, ['tomato'])
    B) ([99, 98], 3, ['apricot', 'pear'])
       This code produces a TypeError

    C) ([99, 98], 3, ['apricot', 'pear', 'tomato'])
    D) This code produces a TypeError
    E) None of the above
    """

def question_119():
    """
    What prints when the following code is executed?

    t = ('apple', 17.3, [99, 98])
    num = t[2]
    num[1] = 0
    print(t)

    A) ('apple', 17.3, [99, 0])
    B) ('apple', 17.3, [99, 98])
    C) ('apple', 17.3, [0, 98])
    D) This code produces a TypeError
    E) None of the above
    """

def question_120():
    """
    What prints when the following code is executed?

    t = ('apple', 17.3, [99, 98])
    lst = t[2]
    t[2][0] = 12
    lst.append('pear')
    print(t)
    print(lst)

    A)
      ('apple', 17.3, [12, 98, 'pear'])
      [12, 98, 'pear']

    B)
      ('apple', 17.3, [99, 98])
      [99, 98, 'pear']

    C)
      ('apple', 17.3, [12, 98])
      [99, 98, 'pear']

    D) This code produces a TypeError
    E) None of the above
    """

def question_121():
    """
    What is the output of the following code?

    lst = ['cat', 'dog', 'p']
    lst[1] = lst[0][0]
    print(len(lst) + len(lst[1]))

    A) 3
    B) 4
    C) 7
    D) 8
    E) No output; there is an error
    """

def question_122():
    """
    What are the values of lst1 and lst2 respectively?

    lst1 = [1, 2, 3]
    lst2 = [lst1] + [lst1]
    lst2[0] = 99

    A) lst1: [1, 2, 3] lst2: [99, 2, 3, 1, 2, 3]
    B) lst1: [99, 2, 3] lst2: [99, 2, 3, 1, 2, 3]
    C) lst1: [1, 2, 3] lst2: [99, [1, 2, 3]]
    D) lst1: [99, 2, 3] lst2: [99, [1, 2, 3]]
    E) None of the above
    """

def question_123():
    """
    What is the value of lst after this code runs?

    lst = [2, 3, 5, 7, 11, 17, 19]
    lst.pop(3)
    lst.remove(2)

    A) [2, 7, 11, 17, 19]
    B) [5, 7, 11, 17, 19]
    C) [2, 3, 11, 17, 19]
    D) [3, 5, 11, 17, 19]
    E) Nothing; the code produces an error
    """

def question_124():
    """
    What is the output of the following code?

    lst = [20, 15.5, 12.0, 7, 33]
    minimum = min(lst)
    maximum = max('whale')
    print(minimum, maximum)

    A) 7 e
    B) 7 w
    C) 7.0 w
    D) No output; there is an error
    """

def question_125():
    """
    Consider the code below that runs on an arbitrary list lst. What does it do?

    lst = [...]  # a list
    good = True
    i = 0
    while i < len(lst) - 1 and good:
        good = lst[i] < lst[i + 1]
        i = i + 2
    print(good)

    A) prints whether the list is sorted
    B) prints whether each pair of elements in the list is in increasing order
    C) prints whether the first pair of elements in the list is in increasing order
    D) works fine, but crashes on the empty list
    E) None of the above
    """

def question_126():
    """
    What is the output of the following code?

    lst = [[2, 3, 4], [1, 1]]
    x = 0
    for i in range(len(lst)):
        for j in range(len(lst[0])):
            x = x + lst[i][j]
    print(x)

    A) 2
    B) 7
    C) 11
    D) This code produces an error
    """

def question_127():
    """
    What is the list referred to by a after the following snippet of code is executed?

    a = [[1, 2, 3], [4, 5]]
    b = a[:]
    b.append(8)

    A) [[1, 2, 3], [4, 5]]
    B) [[1, 2, 3], [4, 5], 8]
    C) [[1, 2, 3], [4, 5, 8]]
    D) [[1, 2, 3], [4, 5], [8]]
    """

def question_128():
    """
    What are the values of lst1 and lst2 respectively?

    lst1 = [1, 2, 3]
    lst2 = [lst1] + [lst1]
    lst2[0][1] = 99

    A) lst1: [1, 2, 3] lst2: [[1, 99, 3], [1, 2, 3]]
    B) lst1: [1, 2, 3] lst2: [[99, 2, 3], [1, 2, 3]]
    C) lst1: [99, 2, 3] lst2: [[99, 2, 3], [1, 2, 3]]
    D) lst1: [1, 99, 3] lst2
    """

def question_127():
    """
    What is the list referred to by a after the following snippet of code is executed?

    a = [[1, 2, 3], [4, 5]]
    b = a[:]
    b.append(8)

    A) [[1, 2, 3], [4, 5]]
    B) [[1, 2, 3], [4, 5], 8]
    C) [[1, 2, 3], [4, 5, 8]]
    D) [[1, 2, 3], [4, 5], [8]]
    """

def question_128():
    """
    What are the values of lst1 and lst2 respectively?

    lst1 = [1, 2, 3]
    lst2 = [lst1] + [lst1]
    lst2[0][1] = 99

    A) lst1: [1, 2, 3] lst2: [[1, 99, 3], [1, 2, 3]]
    B) lst1: [1, 2, 3] lst2: [[99, 2, 3], [1, 2, 3]]
    C) lst1: [99, 2, 3] lst2: [[99, 2, 3], [1, 2, 3]]
    D) lst1: [1, 99, 3] lst2: [[1, 99, 3], [1, 99, 3]]
    E) None of the above
    """

def question_129():
    """
    In what situation does the following code fail?

    # read list and value from user
    # print index of first occurrence of value in list
    # or -1 if value is not in list
    lst = input().split()
    value = input()
    i = 0
    num = lst[i]
    while num != value:
        i = i + 1
        num = lst[i]
    if i < len(lst):
        print(i)
    else:
        print(-1)

    A) It never fails
    B) It fails when the list is empty
    C) It fails when the value is not found in the list
    D) It fails in both conditions B and C
    """

def question_130():
    """
    >>> help({}.get)
    Help on built-in function get:
    get(key, default=None, /) method of builtins.dict instance
    Return the value for key if key is in the dictionary, else default.

    What is the output of the following code?

    d = {3: 33}
    d[5] = d.get(4, 12)
    d[4] = d.get(3, 8)
    print(d)

    A) {3: 33, 5: 12, 4: 8}
    B) {3: 33, 5: 12, 4: 33}
    C) {3: 33, 5: 4, 4: 3}
    D) Error caused by get
    """

def question_131():
    """
    What is the output of the following code?

    s1 = {1, 3, 5, 7, 9, 11}
    s2 = {11, 22, 33}
    s1.update(s2)
    s2.add(44)
    s1.remove(3)
    print(f'{s1}\n{s2.intersection(s1)}')

    A) {1, 3, 7, 9, 11, 11, 22, 33}
       {33, 11, 22}
    B) {1, 3, 7, 9, 11, 11, 22, 33}
       {11, 22, 33}
    C) {1, 3, 7, 9, 11, 22, 33}
       {11, 22, 33}
    D) {1, 5, 7, 9, 11, 22, 33}
       {11, 22, 33}
    E) None of the above
    """

def question_132():
    """
    What is the output of the following code after execution?

    d = {'seedling': {'Paper Birch': 1000, 'White Spruce': 200, 'Red Oak': 567},
         'sapling': {'Paper Birch': 500, 'Lodgepole Pine': 400, 'Red Oak': 1212},
         'adult': {'Paper Birch': 400, 'Lodgepole Pine': 20, 'White Spruce': 789,
                   'Sugar Maple': 873},
         'mature': {'White Spruce': 1111, 'Sugar Maple': 1277}}
    t = 0
    for i in d:
        for j in d[i]:
            if d[i][j] == 'Paper Birch':
                t = t - 100
            elif j == 'Paper Birch':
                t += d[i][j]
            else:
                d[i][j] = d[i].get(j, -1)
    print(t)
    print(d)

    A) Prints the total count of 'Paper Birch' values and updates other dictionary values.
    B) Raises a KeyError due to incorrect dictionary access.
    C) Prints a negative value due to improper calculations and dictionary modifications.
    D) Outputs zero as t remains unchanged throughout execution.
    E) Raises a TypeError due to incorrect comparisons within the dictionary operations.
    """

def question_133():
    """
    What is the content of the book.txt file? Note: there was no book.txt file in the directory before execution of the following code.

    txt_file = open('book.txt', 'w')
    txt_file.write('Once upon a time in a land')
    txt_file.write('far, far, far away...')
    txt_file.close()

    A) The file is empty
    B) Once upon a time in a land
    far, far, far away...
    C) Once upon a time in a land far, far, far away...
    D) Once upon a time in a landfar, far, far away...
    E) None of the above
    """

def question_134():
    """
    Assume book.txt exists in your directory with the content from the previous example. What is the content of the variable data?

    txt_file = open('book.txt', 'r')
    txt_file.write('there lived a silver giant...')
    txt_file.seek(0)
    data = txt_file.readlines()

    A) ['Once upon a time in a landfar, far, far away...there lived a silver giant...']
    B) 'Once upon a time in a landfar, far, far away...there lived a sliver giant...'
    C) 'there lived a silver giant...'
    D) ['there lived a silver giant...']
    E) None of the above
    """

def question_135():
    """
    Let book.txt have the following 2 lines:

    12 13
    Perhaps better poetry will be written in...

    After the execution of the code below, what prints?

    txt_file = open('book.txt', 'r')
    while txt_file.readline() != '':
        print(txt_file.readline().rstrip())
    txt_file.close()

    A) "12 13" followed by "Perhaps better poetry will be written in..."
    B) "Perhaps better poetry will be written in..."
    C) An empty string prints due to the loop structure.
    D) A FileNotFoundError occurs because book.txt does not exist.
    E) The code prints "Perhaps better poetry will be written in..." twice.
    """

def question_136():
    """
    Let book.txt have the following 2 lines:

    12 13
    Perhaps better poetry will be written in...

    After the execution of the code below, what prints?

    txt_file = open('book.txt', 'r')
    line = 'x'
    while line != '':
        line = txt_file.readline()
        print(line.rstrip())
    txt_file.close()

    A) "12 13" followed by "Perhaps better poetry will be written in..."
    B) "Perhaps better poetry will be written in..."
    C) An empty string prints due to the loop structure.
    D) A FileNotFoundError occurs because book.txt does not exist.
    E) The code prints an extra blank line due to the loop condition.
    """

def question_137():
    """
    Let book.txt have the following 2 lines:

    12 13
    Perhaps better poetry will be written in...

    After the execution of the code below, what prints?

    txt_file = open('book.txt', 'r')
    line = txt_file.readline()
    while line != '':
        line = txt_file.readline()
        print(line.rstrip())
    txt_file.close()

    A) "12 13" followed by "Perhaps better poetry will be written in..."
    B) "Perhaps better poetry will be written in..."
    C) An empty string prints due to the loop structure.
    D) A FileNotFoundError occurs because book.txt does not exist.
    E) The code prints "Perhaps better poetry will be written in..." twice.
    """

def question_138():
    """
    Let book.txt have the following 2 lines:

    12 13
    Perhaps better poetry will be written in...

    After the execution of the code below, what prints?

    txt_file = open('book.txt', 'r')
    line = txt_file.readline()
    while line != '':
        print(line.rstrip())
        line = txt_file.readline()
    txt_file.close()

    A) "Perhaps better poetry will be written in..."
    B) "12 13" followed by "Perhaps better poetry will be written in..."
    C) A FileNotFoundError occurs because book.txt does not exist.
    D) Nothing prints due to incorrect loop conditions.
    E) The code prints each line twice due to the loop structure.
    """

def question_139():
    """
    What does the following code do?

    txt_file = open('book.txt', 'r+')
    lst = []
    for line in txt_file:
        lst.append(line.rstrip().split())
    txt_file.close()
    s = ''
    for item in lst:
        if len(item) < 10:
            s = s + ' ' + item + '\n'
    txt_file.write(s)
    print(s * 5)
    txt_file.close()

    A) Reads a file, splits lines into lists, and writes modified content back to the file.
    B) Reads a file, but raises an error when trying to write after closing the file.
    C) Successfully processes and writes data back, ensuring correct formatting.
    D) Creates a list of words but fails to store data due to incorrect string concatenation.
    E) Reads lines into a list and attempts to write data but results in an unintended infinite loop.
    """

def question_140():
    """
    What does the snippet of code below do? Will it work correctly for all input?

    phrase = input('enter a string: ')
    file_name = 'data.txt'
    count = 0
    for char in phrase:
        if char == 'a':
            count += 1
    try:
        num = int(input())
        output_file = open(file_name, 'r')
    except FileNotFoundError:
        print(f'{file_name} file does not exist in the directory')
        output_file = open(file_name, 'w')
    else:
        for i in range(count):
            print('*' * i)
        print(num + phrase)
    finally:
        output_file.write(f'the phrase entered by user is: {phrase}')
        print('written to file successfully')

    A) Counts occurrences of 'a' in a string and prints '*' accordingly, handling file errors.
    B) Opens a file for writing but fails to count occurrences of 'a' correctly.
    C) Raises a ValueError when trying to open a file due to incorrect input handling.
    D) Successfully executes without exceptions regardless of user input.
    E) Always creates a file named 'data.txt' without using any input values.
    """

def question_141():
    """
    What is the output of the snippet of code below after it is executed?

    lst = [[1, 2, 3], [4, "X", 6], [7, 8, 9]]
    data = {1: "A", 2: "B", 3: "C", 4: "D", 6: "F", 7: "G", 8: "H", 9: "I"}

    for row in list:
        for i in range(len(row)):
            row[i] = data[row[i]]
    print(list[1][1])

    A) It will print “X”
    B) It will print “B”
    C) This code produces a KeyError
    D) This code produces a ValueError
    """

import math
from abc import ABC, abstractmethod

def question_142():
    """
    A function uses Merge Sort to sort the characters of a string in alphabetical order.
    What is the output for the input 'merge'?

    A) 'eegmr'
    B) 'merge'
    C) 'egrem'
    D) 'mrege'
    E) 'eemgr'
    """

def question_143():
    """
    In the context of a p-series implemented as a class inheriting from Progression,
    what condition must be met for the series to be convergent, based on Calculus II section 8.2?

    A) p > 1
    B) p < 1
    C) p = 1
    D) p >= 1
    E) p <= 1
    """

def question_144():
    """
    Consider an iterable that returns the factorial of numbers from 'start' to 'end' inclusive,
    using math.factorial(). What is the first value returned for start=3 and end=5?

    A) 6
    B) 24
    C) 120
    D) 1
    E) 0
    """

def question_145():
    """
    What is the output of the following code?

    class A:
        def show(self):
            print("A")

    class B(A):
        def show(self):
            print("B")

    b = B()
    b.show()

    A) "A"
    B) "B"
    C) "A B"
    D) Error
    E) None
    """

def question_146():
    """
    Consider a recursive function to sum a list of integers:

    def sum_list(lst):
        if not lst:
            return 0
        return lst[0] + sum_list(lst[1:])

    What is the time complexity of this function?

    A) O(1)
    B) O(n)
    C) O(n log n)
    D) O(n^2)
    E) O(2^n)
    """

def question_147():
    """
    What is the output of the following code?

    class Vehicle:
        def __init__(self, make):
            self.make = make

        def get_type(self):
            return "Vehicle"

    class Car Ascendantly:
        def get_type(self):
            return "Car"

    v = Vehicle("Toyota")
    c = Car("Honda")

    print(v.get_type())
    print(c.get_type())

    A) "Vehicle" followed by "Car"
    B) "Toyota" followed by "Honda"
    C) "Vehicle" followed by "Vehicle"
    D) "Car" followed by "Car"
    E) Error
    """

def question_148():
    """
    Consider a Progression class with a method sumProgression(n) that returns the sum
    of the first n values. For an arithmetic progression with first term 1 and common
    difference 2, what is sumProgression(3)?

    A) 6
    B) 9
    C) 12
    D) 15
    E) 18
    """

def question_149():
    """
    Given the following directory JSON, what is the total size of all files?

    {
        "\\main": {
            "\\photos": {
                "\\Summer Trip": {
                    "beach.png": 2400,
                    "mountain.png": 1200,
                    "lasagna.png": 2000
                },
                "\\Winter Trip": {
                    "cabin.png": 2000,
                    "skiing.png": 1800
                }
            },
            "\\Homework": {
                "\\Math": {
                    "Algebra.pdf": 1000,
                    "Statistics.txt": 1300,
                    "\\Physics": {
                        "Mechanics.pdf": 2000,
                        "Electromagnetism.txt": 2200
                    }
                }
            }
        },
        "\\backup": {
            "\\photos": {
                "\\Summer Trip": {
                    "beach.png": 2400,
                    "mountain.png": 1200,
                    "city.mp4": 5800,
                    "forest.mp4": 5600,
                    "lasagna.png": 2000
                }
            }
        }
    }

    A) 32900
    B) 30900
    C) 29500
    D) 28000
    E) 25000
    """

def question_150():
    """
    In a Vehicle class hierarchy where Vehicle is an abstract class with attributes
    brand and year, and Car inherits from it, which constructor allows Car to be
    initialized with year, brand, and number of seats?

    A) def __init__(self, year, brand, seats):
           super().__init__(brand, year)
           self.seats = seats
    B) def __init__(self, brand, year):
           self.brand = brand
           self.year = year
    C) def __init__(self):
           self.brand = "unknown"
           self.year = "unknown"
    D) def __init__(self, brand):
           self.brand = brand
           self.year = "unknown"
    E) def __init__(self, seats):
           self.seats = seats
    """

def question_151():
    """
    In an orchestra system, what is the output when adding StringInstrument("Violin")
    and WoodwindInstrument("Flute") to an Orchestra and calling perform()?

    A) ['Vibrations of strings', 'Resonant breathy tones']
    B) ['Resonant breathy tones', 'Vibrations of strings']
    C) 'Vibrations of strings' followed by 'Resonant breathy tones'
    D) Error due to abstract class instantiation
    E) ['Violin', 'Flute']
    """

def question_152():
    """
    Consider a recursive function to check if a word is a palindrome:

    def is_palindrome(word):
        if len(word) <= 1:
            return True
        if word[0] != word[-1]:
            return False
        return is_palindrome(word[1:-1])

    What is the time complexity of this function?

    A) O(1)
    B) O(n)
    C) O(n log n)
    D) O(n^2)
    E) O(2^n)
    """

def question_153():
    """
    For PyramidIterable('cow'), what is the sequence of outputs when iterated?

    A) 'c', 'co', 'cow'
    B) 'cow', 'co', 'c'
    C) 'c', 'ow', 'cow'
    D) 'co', 'c', 'cow'
    E) 'cow', 'c', 'co'
    """

def question_154():
    """
    In an abstract Vehicle class with method rent_cost(days), which is a valid
    implementation for a derived Car class?

    A) def rent_cost(self, days): return 50 * days
    B) def rent_cost(self): return 100
    C) def rent_cost(self, days): return "50 * days"
    D) def rent_cost(self, days): print(50 * days)
    E) def rent_cost(self, days): return None
    """

def question_156():
    """
    Given sorting algorithms with their worst-case time complexities:
    - Selection Sort: O(n^2)
    - Insertion Sort: O(n^2)
    - Merge Sort: O(n log n)
    - Quick Sort: O(n^2)
    - Binary Search: O(log n)
    Which ranks them in descending order of time complexity?

    A) Selection Sort = Insertion Sort = Quick Sort > Merge Sort > Binary Search
    B) Merge Sort > Quick Sort > Selection Sort > Insertion Sort > Binary Search
    C) Quick Sort > Merge Sort > Selection Sort > Insertion Sort > Binary Search
    D) Selection Sort > Merge Sort > Quick Sort > Insertion Sort > Binary Search
    E) Merge Sort = Quick Sort > Selection Sort = Insertion Sort > Binary Search
    """

def question_157():
    """
    In a Cat class inheriting from Animal, what is the average daily sleep time?

    A) 12 to 16 hours
    B) 8 to 10 hours
    C) 6 to 8 hours
    D) 10 to 12 hours
    E) 16 to 20 hours
    """

def question_158():
    """
    For the recursive function:

    def mysteryFunc(n):
        if n <= 1:
            return n
        return mysteryFunc(n-1) + mysteryFunc(n-2)

    What is the time complexity?

    A) O(n)
    B) O(n^2)
    C) O(n log n)
    D) O(2^n)
    E) O(log n)
    """

def question_159():
    """
    In a DeskLamp class with a replace method, what happens when replacing a
    lightbulb with different wattage?

    A) Raises IncompatibleLightBulb exception
    B) Overwrites the existing lightbulb
    C) Returns True
    D) Sets wattage to default (25)
    E) No change occurs
    """

def question_161():
    """
    Given a dictionary of students and R scores, which QuickSort pivot choice
    ensures deterministic sorting when sorting by score?

    A) Last element
    B) First element
    C) Middle element
    D) Random element
    E) Median of three
    """