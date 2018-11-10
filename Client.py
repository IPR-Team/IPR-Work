import asyncio
import websockets
################################ Used for SIMPLE user choices (with one index)
def get_possible_choices(message):
   results = list()
   temp_list = message.split(":")[1].split("\n")            # Splitting message from possible choices
   for temp in temp_list:
      if temp:                                              # Checking for empty string
         results.append(temp.split(" ")[1])                 # Removing the number
   return results
################################ Check a SINGLE the user input
def get_user_input(possible_choices):
   index = 0
   while(True):
         try:
            index = int(input("\nYour choice: "))-1
            if index < 0:
               raise IndexError()
            possible_choices[index]
            break
         except ValueError:
            print("Please enter a number!")
         except IndexError:
            print("Your value is not in range!")
   return index
################################ User input for data selection
def get_data_selection(message):
    results = list()
    temp_list = message.split(":", 1)[1].split("\n")
    for temp in temp_list:
        if temp:
            print(temp.split(":")[0])
            results.append(temp.split(":")[0].split(" ")[1])
    index = 0
    user_selection = dict()
    while(True):
        try:
            index = int(input("\nYour choice: "))-1
            if index < 0:
                raise IndexError()
            results[index]                          # Raises errors, if invalid
            value = ""
            if temp_list[index + 1].split(":")[2] == "False":
                value = input("\nEnter value for "+results[index]+"(leave empty, if not desired): ")
            user_selection[results[index]] = value.strip()
        except ValueError:
            print("Please enter a number!")
        except IndexError:
            print("Your value is not in range!")
        text = input("Do you want to select more (y - yes | n - no): ")
        if text == "y":
            print("Proceeding...")
        elif text == "n":
            break
        else:
            print("No valid input. Canceling...")
            break
    return user_selection
################################ Converts user input to XML
def prepare_data(data):
    message = ""
    buffer = list()                                         # Content
    stages = list()                                         # Saves the stage on which the element is located
    parents = list()                                        # Contains open parent elements
    element_name = ""
    has_subelements = ""
    i = 0
    while i < len(data):
        line_data = data[i].split(":")
        element_name = line_data[0]
        stages.append(int(line_data[1]))
        has_subelements = line_data[2]
        if parents:                                         # Using the stage to close possible parent elements
            parrent_stage = int(parents[-1][1])
            while parrent_stage >= stages[-1]:              # Print parents
                parent_element = parents[-1][0]
                buffer.append("</"+parent_element+">")
                parents.pop()
                if not parents:
                    break
                parrent_stage = int(parents[-1][1])
        if len(line_data) == 4:                             # Attribute element
            a = 0
            while a < len(buffer):
                if parents[-1][0] in buffer[a]:             # Attributes must be appended to the parent element
                    text = input(element_name+":")
                    buffer[a] = buffer[a][:-1]+" "+element_name+"=\""+text+"\">"
                    break
                a += 1
        elif has_subelements == "False":                    # Element does not have subelement => will be closed
            stages.pop()
            text = input(element_name+":")
            buffer.append("<"+element_name+">"+text+"</"+element_name+">")
        else:                                               # Element has nested subelements
            parents.append(line_data)
            buffer.append("<"+element_name+">")
        i += 1
        if i >= len(data):                                  # Last element
            while parents:                                  # Closing possible parent elements
                parent_element = parents[-1][0]
                buffer.append("</"+parent_element+">")
                parents.pop()
    for line in buffer:
        message += line+"\n"
    return message
################################ Client
async def connect_to(websocket_address):
    async with websockets.connect(websocket_address) as websocket:
        await websocket.send("1:")                          # Message to establish the connection
        response = await websocket.recv()                   # Welcome message
        print(response)
        possible_choices = get_possible_choices(response)   # User input for file seletion
        index = get_user_input(possible_choices)
        print("Retrieving data from "+possible_choices[index])
        await websocket.send("2:"+str(index))
        response = await websocket.recv()                   # Gets available data for choosen file  
        dictionary = get_data_selection(response)
        message = ""
        for key in dictionary:
           message += key +" = "+ dictionary[key]+"|"
        print("Retrieving data...")
        await websocket.send("3:"+message)
        response = await websocket.recv()                   # User selects output format
        print(response)
        possible_choices = get_possible_choices(response)
        index = get_user_input(possible_choices)
        await websocket.send("4:"+str(index))
        response = await websocket.recv()                   # Result of selected data
        print(response)
        possible_choices = get_possible_choices(response)   # User selects if they want to add data?
        index = get_user_input(possible_choices)
        if index == 1:
            websocket.close()
            return
        else:
            await websocket.send("5:"+str(index))
        response = await websocket.recv()                   # Selecting a file to add data
        print(response)
        possible_choices = get_possible_choices(response)
        index = get_user_input(possible_choices)
        await websocket.send("6:"+str(index))
        response = await websocket.recv()
        message = response.split("|")
        data = list()
        for m in message:
            if m != "":
                data.append(m)
        message = prepare_data(data)
        await websocket.send("7:"+message)
        response = await websocket.recv()
        print(response)

def main():
    asyncio.get_event_loop().run_until_complete(connect_to('ws://localhost:1511'))

if __name__ == "__main__":
    main()
