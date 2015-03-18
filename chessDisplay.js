"use strict";
var ColorNames = ['White','Empty','Black']; // increment Color by 1 to get index
var ColorAbbr = ['w','.','b']; // increment Color by 1 to get index
var PieceNames = ['Empty','Pawn (unmoved)','Pawn','Rook (unmoved)','Rook','Knight','Bishop','Queen','King (unmoved)','King'];
var PieceAbbr = ['.','p','P','r','R','N','B','Q','k','K'];

function SetInputValue(Id, Value) {
    document.getElementById(Id).value = Value;
}
function SetElementContents(Id, Contents) {
    document.getElementById(Id).innerHTML = Contents;
}

function ShowElement(Id) {
    document.getElementById(Id).style.display = 'block';
}
function HideElement(Id) {
    document.getElementById(Id).style.display = 'none';
}

function WriteLogEntry(LogEntry) {
	if (Trace == 'Off') { return; }
    var mydiv = document.getElementById('Log');  
    var newcontent = document.createElement('div');
    var Indent = CurDepth * 4;
    var MarginLeft = CurDepth + 'em; ';
    newcontent.innerHTML = "<div style='margin-left:" + MarginLeft
    + "' >" + LogEntry + '</div>';
    while (newcontent.firstChild) {
        mydiv.appendChild(newcontent.firstChild);
    }
    
}
function ClearLog() {
    SetElementContents('Log','');
}

function WriteColorName(Color) {
    return ColorNames[Color + 1];
}
function WritePieceName(Piece) {
    return PieceNames[Piece];
}

function WriteToMoveLog(Move) {
	var Color = WriteColorName(Move[MoveColorPieceInx][COLOR]),
		Piece = WritePieceName(Move[MoveColorPieceInx][PIECE]),
		RowFrom = 'r' + Move[MoveFromPosInx][ROW],
		FileFrom = 'f' + Move[MoveFromPosInx][FILE],
		RowTo = 'r' + Move[MoveToPosInx][ROW],
		FileTo = 'f' + Move[MoveToPosInx][FILE],
		ColorTaken = WriteColorName(Move[MoveColorPieceTakenInx][COLOR]),
		PieceTaken = WritePieceName(Move[MoveColorPieceTakenInx][PIECE]),
		MoveType = TranslateMoveType(Move[MoveTypeInx]),
        Score = Move[MoveScoreInx],
        Time = ElapsedTime /1000;
    
    if (ColorTaken == 'Empty') { 
        ColorTaken = '';
        PieceTaken = '';
    }
    if (MoveType == 'Normal') {
        MoveType = '';
    }
    if (Score == 0) {
        Score = '';
    }
    Score = Score.toString().substring(0,6);
    
    if (Time == 0  || Time === NaN) {
        Time = '';
    }        
    GameMoveCount++;
    
    var MoveTable = document.getElementById('GameMovesTable');  
	var NewRow = MoveTable.insertRow(-1);
	var CellInx = 0;
	var NewCell;
	
	function AddCell(Contents) {
		NewCell = NewRow.insertCell(CellInx);
		CellInx++;
		NewCell.innerHTML = Contents;
	}
	
	AddCell(GameMoveCount);
    AddCell(Color + ' ' + Piece);
	AddCell(RowFrom + ' ' + FileFrom);
	AddCell(RowTo + ' ' + FileTo);
	AddCell(ColorTaken + ' ' + PieceTaken);
	AddCell(MoveType);    
	AddCell(Score);       
	AddCell(Time); 
    
    ShowElement('GameMovesTable');
}

function WriteToMovesConsideredTable(Move) {
	var Color = WriteColorName(Move[MoveColorPieceInx][COLOR]),
		Piece = WritePieceName(Move[MoveColorPieceInx][PIECE]),
		RowFrom = 'r' + Move[MoveFromPosInx][ROW],
		FileFrom = 'f' + Move[MoveFromPosInx][FILE],
		RowTo = 'r' + Move[MoveToPosInx][ROW],
		FileTo = 'f' + Move[MoveToPosInx][FILE],
		ColorTaken = WriteColorName(Move[MoveColorPieceTakenInx][COLOR]),
		PieceTaken = WritePieceName(Move[MoveColorPieceTakenInx][PIECE]),
		MoveType = TranslateMoveType(Move[MoveTypeInx]),
        Score = Move[MoveScoreInx],
        Time = ElapsedTime /1000;
    
    if (ColorTaken == 'Empty') { 
        ColorTaken = '';
        PieceTaken = '';
    }
    if (MoveType == 'Normal') {
        MoveType = '';
    }
    if (Score == 0) {
        Score = '';
    }
    Score = Score.toString().substring(0,6);

    if (Time == 0 ) {
        Time = '';
    }        

    var MoveTable = document.getElementById('MovesConsideredTable');  
	var NewRow = MoveTable.insertRow(-1);
	var CellInx = 0;
	var NewCell;
	
	function AddCell(Contents) {
		NewCell = NewRow.insertCell(CellInx);
		CellInx++;
		NewCell.innerHTML = Contents;
	}
	
	AddCell(Color + ' ' + Piece);
	AddCell(RowFrom + ' ' + FileFrom);
	AddCell(RowTo + ' ' + FileTo);
	AddCell(ColorTaken + ' ' + PieceTaken);
	AddCell(MoveType);    
	AddCell(Score);       
	AddCell(Time);    
}

function ClearTable(TableId) {
    var table = document.getElementById(TableId);
    //or use :  var table = document.all.tableid;
    for(var i = table.rows.length - 1; i > 0; i--)
    {
        table.deleteRow(i);
    }
}

function WriteCurrentPieceAndPos(Row, File, Color, Piece) {
    if (DebugLevel > 1) {
        var ColorName = ColorNames[Color + 1];
        var PieceName = PieceNames[Piece];
        var LogEntry = '<br>[d' + CurDepth + '] Considering possible moves for ' + ColorName + ' ' + PieceName + ' at row ' + Row + ', file ' + File;
        WriteLogEntry(LogEntry);
    }
}

function TranslateMoveType(MoveTypeCode) {
    var MoveType;
    var MoveTypes = [
        '*** Null ***',
        'Normal',
        'Evaluate (Max depth)',
        'Pawn Promotion to Queen',
        'Pawn Promotion to Knight',
        'Castle',
        ' *** CHECKMATE! *** '
    ]; 
   
    if (MoveTypeCode >= MoveTypes.length || MoveTypeCode < 0) { 
        ShowError('Illegal value ' + MoveTypeCode + ' for MoveTypeCode'); 
        MoveTypeCode = 0;
    }
   
    return MoveTypes[MoveTypeCode];
}

function ShowError(Message) {
    alert(Message);   
}

function Dummy1() {
    switch (MoveTypeCode) {
    case 0:
        MoveType = '*** Null ***';
        break;
    case 1:
        MoveType = 'Normal';
        break;
    case 2:
        MoveType = 'Evaluate (Max depth)';
        break;
    case 3:
        MoveType = 'Pawn Promotion';
        break;
    case 4:
        MoveType = 'Castle';
        break;
    default:
        MoveType = '***Unknown ***';
    }
    return MoveType;
}
    
function ExplainMove(Move) {
    var Explanation = '';
    var MoveFrom = Move[MoveFromPosInx];
    var MoveTo = Move[MoveToPosInx];
    
    var ColorPieceMoved = Move[MoveColorPieceInx];
    var ColorMoved = ColorPieceMoved[0];
    var PieceMoved = ColorPieceMoved[1];
    
    var ColorPieceTaken = Move[MoveColorPieceTakenInx];
    var ColorTaken = ColorPieceTaken[0];
    var PieceTaken = ColorPieceTaken[1];
    
    var MoveType = Move[MoveTypeInx];
    var MoveScore = Move[MoveScoreInx];
    
    Explanation += ColorNames[ColorMoved +1] + ' ' + PieceNames[PieceMoved] 
        + ' from row ' + MoveFrom[0] + ', file ' + MoveFrom[1]
        + ', to row ' + MoveTo[0] + ', file ' + MoveTo[1];
    if (ColorPieceTaken[0] != 0) {
        Explanation += ' taking ' + ColorNames[ColorTaken + 1] + ' ' + PieceNames[PieceTaken];
    }
    if (MoveType != MoveTypeNormal) {
        Explanation += ' *** ' + TranslateMoveType(MoveType) + ' *** ';
    }
    if (MoveScore != 0) { 
        Explanation += ', score: ' + MoveScore; 
    }
        
    return Explanation;
}

function SuccinctMove(Move) {
    var Explanation = '';
    var MoveFrom = Move[MoveFromPosInx];
    var MoveTo = Move[MoveToPosInx];
    
    var ColorPieceMoved = Move[MoveColorPieceInx];
    var ColorMoved = ColorPieceMoved[0];
    var PieceMoved = ColorPieceMoved[1];
    
    var ColorPieceTaken = Move[MoveColorPieceTakenInx];
    var ColorTaken = ColorPieceTaken[0];
    var PieceTaken = ColorPieceTaken[1];
    
    var MoveType = Move[MoveTypeInx];
    var MoveScore = Move[MoveScoreInx];
    
    Explanation += CurDepth + ': ' + ColorAbbr[ColorMoved +1] + PieceAbbr[PieceMoved] 
        + ' ' + MoveFrom[0] + MoveFrom[1]
        + '->' + MoveTo[0] + MoveTo[1];
    if (ColorPieceTaken[0] != 0) {
        Explanation += ' (' + ColorAbbr[ColorTaken + 1] + PieceAbbr[PieceTaken] + ') ';
    } else {
        Explanation += ' .... '; 
    }
    if (MoveType != MoveTypeNormal) {
        Explanation += ' ' + MoveType + ' ';
    } else {
        Explanation += ' . ';   
    }
    if (MoveScore != 0) { 
        Explanation += MoveScore.toString().substring(0,8);
    }
        
    return Explanation;
}

function ShowBoardX() {
    var DisplayPieces = ['&nbsp;&nbsp;','-','+','#','#','&','X','@','^','^'];
    var DisplayBoard = "<table style='border: solid thick black; border-collapse:collapse; background-color:#bbb; font-weight:bold;'>", pos = '', rowNo, fileNo, Row = '';
    var Color, Piece, Style;
    for (rowNo = 0; rowNo < 8; rowNo++) {
        Row = '<tr>';
        for (fileNo = 0; fileNo < 8; fileNo++) {
            Color = Board[rowNo][fileNo][COLOR];
            switch (Color) {
            case BLACK:
                Style = " style = 'background-color:#000; color:white;' "; 
                break;
            case WHITE:
                Style = " style = 'background-color:#fff; color:black;' "; 
                break;
            default:
                Style = '';                    
            }

            Piece = Board[rowNo][fileNo][PIECE];
            
            pos = '<td' + Style + ' > ' + DisplayPieces[Piece] + ' ';
            Row += ' ' + pos;
        }
        DisplayBoard += Row;
    }
    
    return DisplayBoard;
}

function ShowMove(Move) {
	Move = Move || 0; // optional Move argument
    var DisplayPieces = ['&nbsp;&nbsp;','-','+','#','#','&','X','@','^','^'];
    var DisplayBoard = "<table id='Board' style='border: solid thick black; border-collapse:collapse; background-color:#bbb; font-weight:bold;'>", pos = '', rowNo, fileNo, Row = '';
    var Color, Piece, Style;
	var Id;
    
    var MoveFromPos = -1;
    var MoveFromRow = -1;
    var MoveFromFile = -1;
    
    var MoveToPos = -1;
    var MoveToRow = -1;
    var MoveToFile = -1;
	
	if (Move != 0) {
		MoveFromPos = Move[MoveFromPosInx];
		MoveFromRow = MoveFromPos[ROW];
		MoveFromFile = MoveFromPos[FILE];
		
		MoveToPos = Move[MoveToPosInx];
		MoveToRow = MoveToPos[ROW];
		MoveToFile = MoveToPos[FILE];
	}
    
    for (rowNo = 0; rowNo < 8; rowNo++) {
        Row = '<tr>';
        for (fileNo = 0; fileNo < 8; fileNo++) {
            Color = Board[rowNo][fileNo][COLOR];
            switch (Color) {
            case BLACK:
                Style = " style = 'background-color:black; color:white;' "; 
                break;
            case WHITE:
                Style = " style = 'background-color:white; color:black;' "; 
                break;
            default:
                if((rowNo + fileNo)%2 > 0) {
                    //alert('>0 bbb');
                    Style = " style = 'background-color:#bbb;' "; 
                } else {
                   //alert('!>0 ddd');
                    Style = " style = 'background-color:#ccc;' "; 
                }
            }                

            Piece = Board[rowNo][fileNo][PIECE];
            
            // Show phantom piece where moved from
            if(rowNo == MoveFromRow && fileNo == MoveFromFile) {
                switch (Move[MoveColorPieceInx][COLOR]) {
                case BLACK:
                    Style = " style = 'background-color:#666; color:#ccc; ' "; 
                    break;
                case WHITE:
                    Style = " style = 'background-color:#ddd; color:#666; ' "; 
                    break;
                default:
                    Style = '';                    
                }
                Piece = Move[MoveColorPieceInx][PIECE];
            }
            
            // Emphasize piece just now moved
            if(rowNo == MoveToRow && fileNo == MoveToFile) {
                switch (Move[MoveColorPieceInx][COLOR]) {
                case BLACK:
                    Style = " style = 'background-color:black; color:white; border: solid thick red;' "; 
                    break;
                case WHITE:
                    Style = " style = 'background-color:white; color:black; border: solid thick red;' "; 
                    break;
                default:
                    Style = '';                    
                }
                Piece = Move[MoveColorPieceInx][PIECE];
            }
            
            Id = '9' + rowNo.toString() + fileNo.toString();
            pos = "<td id='" +Id + "' onClick='BuildMove(" + rowNo + ', ' + fileNo + ")' " + Style + ' > ' + DisplayPieces[Piece] + ' ';
            Row += ' ' + pos;
        }
        DisplayBoard += Row;
    }
    
   document.getElementById('main').innerHTML = DisplayBoard;
}

function BuildMove(RowNo, FileNo) {
	if(document.getElementById('NextRowFrom').value == '') {
        if (Board[RowNo][FileNo][COLOR] != HumanColor) {
            ShowError("That's not your color!");
            return;
        }
		document.getElementById('NextRowFrom').value = RowNo;
		document.getElementById('NextFileFrom').value = FileNo;
	} else {
		document.getElementById('NextRowTo').value = RowNo;
		document.getElementById('NextFileTo').value = FileNo;
	}
	EmphasizeSquare(RowNo, FileNo);
}

function EmphasizeSquare(RowNo, FileNo) {
	var id = '9' + RowNo.toString() + FileNo.toString();
	document.getElementById(id).style.backgroundColor='yellow';

}
		
function MoveHumanMove() {
	var RowFrom = document.getElementById('NextRowFrom').value;
	var FileFrom = document.getElementById('NextFileFrom').value;
	var MyPos = [RowFrom, FileFrom];
	var MyColor = Board[RowFrom][FileFrom][COLOR];
	var MyPiece = Board[RowFrom][FileFrom][PIECE];
	
    var RowTo = document.getElementById('NextRowTo').value;
	var FileTo = document.getElementById('NextFileTo').value;
	var NewPos = [RowTo,FileTo];
	var NewPosOldContents = Board[RowTo][FileTo];
   
    var MyMoveType = MoveTypeNormal;
    
    // detect pawn promotion
    if (MyPiece == PAWN && (RowTo == 0 || RowTo == 7)) { 
        MyPiece = QUEEN;
        MyMoveType = MoveTypePromoteQueen;
    }
	
    // mark pieces as moved from initial position
	switch(MyPiece) {
		case PAWNi:
			MyPiece = PAWN; 
			break;
		case ROOKi:
			MyPiece = ROOK; 
			break;
		case KINGi:
			MyPiece = KING; 
			break;
	}
	
	var MyColorPiece = [MyColor, MyPiece];
	
    var HumanMove = [0.0, MyMoveType, MyColorPiece, MyPos, NewPos, NewPosOldContents];

	MovePiece(HumanMove);
	ShowMove(HumanMove);
	WriteToMoveLog(HumanMove);
    SwitchTurns();
}

function FormatWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}