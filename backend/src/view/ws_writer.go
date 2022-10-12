package view

import (
	// "github.com/gorilla/websocket"
	"pms/src/model"
)

func WriteRoomInfoByWS(pr *model.PokerRoom, u *model.User) error {
	conn := u.WsConn
	if err := conn.WriteJSON(pr); err != nil {
		return err
	} else {
		return nil
	}
}
