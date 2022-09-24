package migration

import (
	"log"

	"pms/src/model"
)

func Migrate() {
	db, err := model.Connection()
	if err != nil {
		log.Panicf("Migration Error: %s", err)
	}
	db.AutoMigrate(&model.User{})
}