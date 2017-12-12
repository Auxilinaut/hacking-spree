import * as Assets from '../assets';
import * as Socket from 'socket.io-client';

export default class Title extends Phaser.State
{
    backgroundTemplateSprite: Phaser.Sprite = null;
    googleFontText: Phaser.Text = null;

    player: Phaser.Sprite = null;
    otherPlayers: OtherPlayer[] = [];

    socket: SocketIOClient.Socket = null;
    inGame: boolean = false;

    public create(): void
    {
        this.socket = Socket('http://192.168.0.101:3000');

        this.backgroundTemplateSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Images.ImagesBackgroundTemplate.getName());
        this.backgroundTemplateSprite.anchor.setTo(0.5);

        /*this.googleFontText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 100, 'Arrows to move, Space to shoot', {
            font: '50px ' + Assets.GoogleWebFonts.Barrio
        });
        this.googleFontText.anchor.setTo(0.5);*/

        this.game.world.setBounds(0, 0, this.game.width, this.game.height);
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.setBoundsToWorld(false,false,false,false,false);
        this.game.physics.p2.applyGravity = false;
        this.game.physics.p2.enableBody(this.game.physics.p2.walls, false);

        this.socket.on("connect", this.onSocketConnected.bind(this));
		this.socket.on("new_player", this.onNewPlayer.bind(this));
		this.socket.on("move_player", this.onEnemyMove.bind(this));
		this.socket.on("remove_player", this.onRemovePlayer.bind(this));

        // this.game.sound.play(Assets.Audio.AudioMusic.getName(), 0.2, true);

        this.game.camera.flash(0x000000, 1000);
    }

    public update(): void
    {
        if (this.inGame)
        {
			let pointer = this.game.input.mousePointer;
			
            if (this.distanceToPointer(this.player, pointer) <= 50)
            {
				this.moveToPointer(this.player, 0, pointer, 100);
            }
            else
            {
				this.moveToPointer(this.player, 500, pointer);
            }
            
			// Send a new position data to the server 
			this.socket.emit('move_player', {x: this.player.x, y: this.player.y, angle: this.player.angle});
		}
    }

    onSocketConnected()
    {
        console.log("connected to server"); 
        this.createPlayer();
        this.inGame = true;
        this.socket.emit('new_player', {x: 0, y: 0, angle: 0});
    }
    
    onRemovePlayer(data)
    {
        let removePlayer = this.findPlayerById(data.id);

        if (!removePlayer)
        {
            console.log('Player not found: ', data.id)
            return;
        }
        
        removePlayer.sprite.destroy();
        this.otherPlayers.splice(this.otherPlayers.indexOf(removePlayer), 1);
    }
    
    createPlayer()
    {
        this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Spritesheets.SpritesheetsCrystal32328.getName());
        this.player.animations.add('spin');
        this.player.animations.play('spin', 30, true);
    
        this.player.anchor.setTo(0.5,0.5);
    
        this.game.physics.p2.enableBody(this.player, true);
        this.player.body.data.shapes[0].sensor = true;
    };
    
    onNewPlayer(data)
    {
        console.log(data);

        this.otherPlayers.push(new OtherPlayer(this.game, data.id, data.x, data.y, data.angle));
    }
    
    onEnemyMove(data)
    {
        console.log(data.id);
        console.dir(this.otherPlayers);
        let movePlayer = this.findPlayerById(data.id); 
        
        if (!movePlayer)
        {
            return;
        }

        movePlayer.sprite.body.x = data.x; 
        movePlayer.sprite.body.y = data.y; 
        movePlayer.sprite.angle = data.angle; 
    }
    
    findPlayerById(id)
    {
        for (let i = 0; i < this.otherPlayers.length; i++)
        {
            if (this.otherPlayers[i].id == id)
            {
                return this.otherPlayers[i]; 
            }
        }
    }

    moveToPointer(displayObject, speed, pointer, maxTime?)
    {
        let angle = this.angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = this.distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }

		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

    }

    distanceToPointer(displayObject, pointer, world?)
    {
        if (world === undefined) world = false;

        let dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        let dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);
    }

    angleToPointer(displayObject, pointer, world?)
    {
        if (world === undefined) world = false;

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
        }
    }

}

class OtherPlayer
{
    x: number;
    y: number;
    id: number;
    angle: number;
    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game, id: number, startx: number, starty: number, start_angle: number)
    {
        this.x = startx;
        this.y = starty;
        this.id = id;
        this.angle = start_angle;
        
        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, Assets.Spritesheets.SpritesheetsCrystal32328.getName());
        this.sprite.animations.add('spin');
        this.sprite.animations.play('spin', 30, true);

        this.sprite.anchor.setTo(0.5,0.5);
    
        // draw a shape
        game.physics.p2.enableBody(this.sprite, true);
        this.sprite.body.data.shapes[0].sensor = true;
    }
}