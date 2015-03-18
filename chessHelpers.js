function GenerateMoveTag() {
    var MoveTag = '[d' + CurDepth +'-';
    var Separator = '';
    for(var Depth = 1; Depth <= CurDepth; Depth++) {
        MoveTag += Separator + DepthCounts[Depth];
        Separator = ':';
    }
    MoveTag += '-' + GlobalMoveCount + '] ';
    return MoveTag;
}

function MovePiece(Move) {
    GlobalMoveCount++;
    DepthCounts[CurDepth]++;
    CumulativeDepthCounts[CurDepth]++;
   
    var ColorPiece = Move[MoveColorPieceInx];
    var Color = ColorPiece[COLOR];
    var Piece = ColorPiece[PIECE];
    
    var FromPos = Move[MoveFromPosInx];
    var FromRow = FromPos[0];
    var FromFile = FromPos[1];
    
    var ToPos = Move[MoveToPosInx];
    var ToRow = ToPos[0];
    var ToFile = ToPos[1];
    
    var ColorPieceTaken = Move[MoveColorPieceTakenInx];
    var ColorTaken = ColorPieceTaken[COLOR];
    var PieceTaken = ColorPieceTaken[PIECE]
    
    /*
    var MoveDescr = '<br>' + MoveTag + ' Moving ' + Color + Piece + ' from ' + FromRow + FromFile + ' to ' + ToRow + ToFile;
    if (ColorTaken != 0) {
        MoveDescr += ' taking ' + ColorTaken + PieceTaken;
    }
    WriteLogEntry(MoveDescr);
    */
	
    Board[FromRow][FromFile] = [0,0];
    Board[ToRow][ToFile] = ColorPiece;

}

function UnMovePiece(Move) {   
    var ColorPiece = Move[MoveColorPieceInx];
    var Color = ColorPiece[COLOR];
    var Piece = ColorPiece[PIECE];
    
    var FromPos = Move[MoveFromPosInx];
    var FromRow = FromPos[0];
    var FromFile = FromPos[1];
    
    var ToPos = Move[MoveToPosInx];
    var ToRow = ToPos[0];
    var ToFile = ToPos[1];
    
    var ColorPieceTaken = Move[MoveColorPieceTakenInx];
    var ColorTaken = ColorPieceTaken[COLOR];
    var PieceTaken = ColorPieceTaken[PIECE];
    
    //WriteLogEntry('UnMoving ' + Color + Piece + ' back to ' + FromRow + FromFile + ' from ' + ToRow + ToFile);
        
    Board[FromRow][FromFile] = ColorPiece;
    Board[ToRow][ToFile] = ColorPieceTaken;
}

