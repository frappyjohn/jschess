"use strict";
var Board;

var BLACK = 1,
    EMPTY = 0,
    WHITE = -1;

var // EMPTY = 0,
    PAWNi = 1, // Pawn on initial square
    PAWN = 2,
    ROOKi = 3,
    ROOK = 4,
    KNIGHT = 5,
    BISHOP = 6,
    QUEEN = 7,
    KINGi = 8,
    KING = 9;

var InitialBoard = [ 
    [ [BLACK, ROOKi], [BLACK, KNIGHT], [BLACK, BISHOP], [BLACK, QUEEN], [BLACK, KINGi], [BLACK, BISHOP], [BLACK, KNIGHT], [BLACK, ROOKi] ],
    
    [ [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi], [BLACK, PAWNi] ],    
     
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    
    [ [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi], [WHITE, PAWNi] ],
    
    [ [WHITE, ROOKi], [WHITE, KNIGHT], [WHITE, BISHOP], [WHITE, QUEEN], [WHITE, KINGi], [WHITE, BISHOP], [WHITE, KNIGHT], [WHITE, ROOKi] ]
];
var EmptyBoard = [ 
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ]
];

/*
Initialize the board
Find all moves for player, remembering best move
For each such move find all moves for opponent, remembering best move
Continue recursing until bottom depth is reached, then evaluate  and return
*/

// Move = [ Score, MoveType, ColorPiece, FromPos, ToPos, ColorPieceTaken;
var NullMove = [ 0.0, 0, [0, 0], [0, 0], [0, 0], [0, 0] ];
// ColorPieces are 2-element arrays:
var COLOR = 0,
    PIECE = 1;
// Positions (from and to) are 2-element arrays:
var ROW = 0,
    FILE = 1;

var MoveScoreInx = 0;
var MoveTypeInx = 1;
var MoveColorPieceInx = 2;
var MoveFromPosInx = 3;
var MoveToPosInx = 4;
var MoveColorPieceTakenInx = 5;

// MoveType codes
// See also: function TranslateMoveType(MoveTypeCode) 
var MoveTypeNull = 0;
var MoveTypeNormal = 1;
var MoveTypeEvaluate = 2; // no move at max depth
var MoveTypePromoteQueen = 3;
var MoveTypePromoteKnight = 4;
var MoveTypeCastle = 5;
var MoveTypeCheckmate = 6;
var MoveTypeInitialMovePawn = 7;
var MoveTypeInitialMoveRook = 8;
var MoveTypeInitialMoveKing = 9;

var GameMoveCount = 0;
var GlobalMoveCount = 0;
var DepthCounts = [0,0,0,0,0,0,0,0,0,0];
var CumulativeDepthCounts = [0,0,0,0,0,0,0,0,0,0];
var MoveTag = '';

// Lookahead paramenters
var MaxDepth = 4;
var DisplayDepth = 1;
var CurDepth = 0; // Always enter with Curdepth = 0
var DebugLevel = 0;

var t0, t1, ElapsedTime; // timers