# VRC Playtime Tracker

VRChat Playtime Tracker is an application that was made to track playtime for standalone quest users due to having no alternative method.
This started out as a personal project but I wanted to make this available for anyone to use so I fully re-developed the application from just CLI to having
a User-Friendly UI and even more features.

Honestly I lost motivation for this but I didn't want to have another project scrapped in my files so I made it work and uploaded it open source so anyone can download
and use it (Might update an maintain if it gets enough attention). Feel free to fork and make changes, I do not care what you do with this and I am not liable to any
possible moderation (Highly unlikely) that happens to your VRChat account as a result of using this application.

## Disclaimer

This application does require you to sign into your valid **VRChat account** (VRChat accounts through [VRChat](https://vrchat.com/home) only, not steam or oculus) and
will not show previous playtime information that has not been collected while the application is running and tracking users.

If you don't trust it, I really do not care just don't use it. If you can't trust it but are this persistent to track your degen 1000+ hours and show your friends a
graph of your playtime, since the application supports tracking friends you can make an alternate account and friend yourself although you will lose the ability to
track the friends on your main account (I do not recommend or condone the use of alternate accounts).

## Installation

This application is currently only available for **Windows**. (Might change in the future)

Goto the [releases page](https://github.com/Solitarju/VRC-Playtime-Tracker/releases) of this repository and find the latest version of the application (as of writing v1.3.2),
under the Assets tab of the version you selected there will be an executable (such as **VRC.Playtime.Tracker.Setup.1.3.2.exe**), install and run, sometimes it will show a warning because the downloader isn't signed, then the application will
be installed. (Feel free to delete the installer after)

For the future if the application needs to be updated just redo the steps above and it will overwrite the current version installed on your system (data will be kept).

## Usage

Once you have the application installed, it's pretty intuitive lmao.

#### Signing in

Initially you will be prompted to login to your **VRChat** account (accounts created through Steam or Oculus will not work, you can merge into a VRChat account), enter your
account details, you can enable the **Remember Login** option so you don't have to Login everytime you start the application (it says unsecure as it stores the current session token, an added benefit is that you re-use session tokens and don't get limited).

![](https://cdn.discordapp.com/attachments/1008440102399254618/1041651723258839070/image.png)

#### Main Menu & Tracker

Now you will find yourself at the main menu, on the left side is where you can switch between menus and enable/disable tracking (big green button if you managed to miss it). On the right side is where you will find
the current menu you have selected, in the case of the tracker you will find how long the tracker has been active in the center of the screen and the bottom left, current websocket connection status
(Used primarily for tracking friends) and the current session time (once you get online this will start counting up and counting your playtime).

![](https://cdn.discordapp.com/attachments/1008440102399254618/1041652384419565578/image.png)

#### Statistics

On the left side where the tracker menu is selected, next to it you will find a statistics button which will take you to the statistics menu where you can find information
on your playtime and information on your friends. Automatically, clicking on the menu will display information for the current signed in user, such as the graph (Past 14d) and
more below it. To see information for friends you have tracked you will have to find their User ID from the [VRChat website](https://vrchat.com/home) and enter it in the
input above the graph.

Find the User ID by clicking on your friends profile on the website and the userid will be in the URL as "usr_blah blah bah" as shown in the image below.

![](https://user-images.githubusercontent.com/72232630/201633110-066057a7-6303-43f5-a1e5-fb7a22eb6505.png)

![](https://cdn.discordapp.com/attachments/1008440102399254618/1041653713539960832/image.png)

#### Settings

At the top left there will be a settings button which will open the settings menu and allow you to change application settings, currently there are only 2 options (Minimize to System Tray
and Start on System Startup).

![image](https://user-images.githubusercontent.com/72232630/201635136-81b7f2dd-c5c2-4089-8190-efeb0030af0a.png)
